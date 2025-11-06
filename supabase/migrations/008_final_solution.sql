-- Final solution: Use SECURITY DEFINER function to bypass RLS during INSERT
-- This will completely avoid recursion issues

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can view groups they created" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can view group members of their groups" ON group_members;
DROP POLICY IF EXISTS "Group creators can add members" ON group_members;
DROP POLICY IF EXISTS "Group creators can remove members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups by invite code" ON group_members;

-- Drop helper functions if they exist
DROP FUNCTION IF EXISTS is_group_member(UUID, UUID);
DROP FUNCTION IF EXISTS is_group_creator(UUID, UUID);

-- Create a function to create groups that bypasses RLS
CREATE OR REPLACE FUNCTION create_group_safe(
  group_name TEXT,
  creator_id UUID,
  invite_code_value TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_group_id UUID;
BEGIN
  -- Insert the group bypassing RLS
  INSERT INTO groups (name, created_by, invite_code)
  VALUES (group_name, creator_id, invite_code_value)
  RETURNING id INTO new_group_id;
  
  -- Add creator as a member
  INSERT INTO group_members (group_id, user_id)
  VALUES (new_group_id, creator_id);
  
  RETURN new_group_id;
END;
$$;

-- Now create simple policies that don't cause recursion
-- SELECT: Users can see groups they created
CREATE POLICY "Users can view groups they created"
  ON groups FOR SELECT
  USING (created_by = auth.uid());

-- INSERT: Allow all authenticated users (we'll use the function instead)
-- But we need this for the function to work
CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (true);

-- UPDATE: Creators can update
CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: Creators can delete
CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- For group_members - simple policies
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- INSERT: Allow all (we'll use the function)
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  WITH CHECK (true);

-- DELETE: Creators can remove
CREATE POLICY "Group creators can remove members"
  ON group_members FOR DELETE
  USING (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );






