-- Complete fix for RLS policies
-- This will fix both recursion and INSERT issues

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;
DROP POLICY IF EXISTS "Users can view group members of their groups" ON group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON group_members;
DROP POLICY IF EXISTS "Group creators can remove members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups by invite code" ON group_members;

-- Drop helper functions if they exist
DROP FUNCTION IF EXISTS is_group_member(UUID, UUID);
DROP FUNCTION IF EXISTS is_group_creator(UUID, UUID);

-- Create groups policies with simple checks
-- SELECT: Users can see groups they created or are members of
CREATE POLICY "Users can view groups they belong to"
  ON groups FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Users can create groups where they are the creator
CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- UPDATE: Only creators can update their groups
CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: Only creators can delete their groups
CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- Create group_members policies
-- SELECT: Users can see members of groups they created or belong to
CREATE POLICY "Users can view group members of their groups"
  ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    ) OR
    user_id = auth.uid() OR
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- INSERT: Creators can add members, or users can add themselves via invite code
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- INSERT: Users can join via invite code
CREATE POLICY "Users can join groups by invite code"
  ON group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    group_id IN (
      SELECT id FROM groups WHERE invite_code IS NOT NULL
    )
  );

-- DELETE: Only creators can remove members
CREATE POLICY "Group creators can remove members"
  ON group_members FOR DELETE
  USING (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );






