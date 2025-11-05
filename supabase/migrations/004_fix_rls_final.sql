-- Final fix for infinite recursion in RLS policies
-- The issue is that policies reference each other during INSERT operations
-- Solution: Use SECURITY DEFINER functions to bypass RLS checks

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;
DROP POLICY IF EXISTS "Users can view group members of their groups" ON group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON group_members;
DROP POLICY IF EXISTS "Group creators can remove members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups by invite code" ON group_members;

-- Create a helper function to check if user is member of a group
-- This function bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION is_group_member(group_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_id_param 
    AND gm.user_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a helper function to check if user created a group
CREATE OR REPLACE FUNCTION is_group_creator(group_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_id_param 
    AND g.created_by = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate SELECT policy for groups - use helper function to avoid recursion
CREATE POLICY "Users can view groups they belong to"
  ON groups FOR SELECT
  USING (
    created_by = auth.uid() OR
    is_group_member(id, auth.uid())
  );

-- Recreate INSERT policy for groups (simple, no recursion)
CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Recreate UPDATE policy for groups
CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Recreate DELETE policy for groups
CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- Recreate SELECT policy for group_members - use helper function
CREATE POLICY "Users can view group members of their groups"
  ON group_members FOR SELECT
  USING (
    is_group_creator(group_id, auth.uid()) OR
    user_id = auth.uid() OR
    is_group_member(group_id, auth.uid())
  );

-- Recreate INSERT policy for group_members - allow creators to add members
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  WITH CHECK (is_group_creator(group_id, auth.uid()));

-- Recreate DELETE policy for group_members
CREATE POLICY "Group creators can remove members"
  ON group_members FOR DELETE
  USING (is_group_creator(group_id, auth.uid()));

-- Allow users to join groups via invite code
CREATE POLICY "Users can join groups by invite code"
  ON group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_members.group_id 
      AND g.invite_code IS NOT NULL
    )
  );

