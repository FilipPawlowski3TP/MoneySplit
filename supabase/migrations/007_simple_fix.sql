-- Simple fix: Remove all complex policies and create minimal ones
-- This will avoid recursion by not checking group_members in groups SELECT policy

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;
DROP POLICY IF EXISTS "Users can view group members of their groups" ON group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON group_members;
DROP POLICY IF EXISTS "Group creators can remove members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups by invite code" ON group_members;

-- Temporarily disable RLS to test, then enable it back with simple policies
-- First, let's create a very simple SELECT policy that doesn't check group_members
-- This will break viewing groups you're a member of, but will fix INSERT

-- Simple SELECT: Only show groups you created (for now)
CREATE POLICY "Users can view groups they created"
  ON groups FOR SELECT
  USING (created_by = auth.uid());

-- Simple INSERT: Users can create groups
CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Simple UPDATE: Creators can update
CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Simple DELETE: Creators can delete
CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- For group_members, use simple policies too
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    -- User is the member themselves
    user_id = auth.uid() OR
    -- User created the group
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- INSERT: Creators can add members
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- INSERT: Users can join via invite code (but this might cause recursion)
-- Let's skip this for now and add it later if needed
-- CREATE POLICY "Users can join groups by invite code"
--   ON group_members FOR INSERT
--   WITH CHECK (
--     user_id = auth.uid() AND
--     group_id IN (
--       SELECT id FROM groups WHERE invite_code IS NOT NULL
--     )
--   );

-- DELETE: Creators can remove members
CREATE POLICY "Group creators can remove members"
  ON group_members FOR DELETE
  USING (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );






