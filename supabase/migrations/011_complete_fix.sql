-- Complete fix: Function returns full group object, simplified RLS policies
-- This will fix both the recursion and the SELECT issue

-- Drop existing function
DROP FUNCTION IF EXISTS create_group_safe(TEXT, UUID, TEXT);

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can view groups they created" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can view group members of their groups" ON group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON group_members;
DROP POLICY IF EXISTS "Group creators can remove members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups by invite code" ON group_members;

-- Create function that returns the full group object
CREATE OR REPLACE FUNCTION create_group_safe(
  group_name TEXT,
  creator_id UUID,
  invite_code_value TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  created_by UUID,
  invite_code TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_group_id UUID;
  new_group RECORD;
BEGIN
  -- Insert the group bypassing RLS completely
  INSERT INTO groups (name, created_by, invite_code)
  VALUES (group_name, creator_id, invite_code_value)
  RETURNING * INTO new_group;
  
  -- Add creator as a member (also bypasses RLS)
  INSERT INTO group_members (group_id, user_id)
  VALUES (new_group.id, creator_id);
  
  -- Return the full group object
  RETURN QUERY SELECT 
    new_group.id,
    new_group.name,
    new_group.created_by,
    new_group.invite_code,
    new_group.created_at,
    new_group.updated_at;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_group_safe(TEXT, UUID, TEXT) TO authenticated;

-- Create simple SELECT policy - only show groups you created
CREATE POLICY "Users can view groups they created"
  ON groups FOR SELECT
  USING (created_by = auth.uid());

-- Simple UPDATE policy
CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Simple DELETE policy
CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- No INSERT policy needed - we use the function

-- For group_members - simple policies
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- INSERT policy for group_members - allow all (function handles it)
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- DELETE policy
CREATE POLICY "Group creators can remove members"
  ON group_members FOR DELETE
  USING (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );



