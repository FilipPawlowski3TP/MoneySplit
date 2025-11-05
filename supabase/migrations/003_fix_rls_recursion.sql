-- Fix infinite recursion in RLS policies
-- The problem is that the SELECT policy on groups references group_members,
-- which can cause recursion when checking policies during INSERT

-- Drop and recreate the SELECT policy for groups to avoid recursion
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;

-- Create a simpler policy using EXISTS instead of IN to avoid recursion
CREATE POLICY "Users can view groups they belong to"
  ON groups FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.user_id = auth.uid()
    )
  );

-- Also fix the group_members SELECT policy to avoid potential recursion
DROP POLICY IF EXISTS "Users can view group members of their groups" ON group_members;

CREATE POLICY "Users can view group members of their groups"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_members.group_id 
      AND groups.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id 
      AND gm2.user_id = auth.uid()
    )
  );

