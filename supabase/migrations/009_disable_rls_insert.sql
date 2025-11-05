-- Temporarily disable RLS for INSERT on groups to test
-- This will allow creating groups without RLS checks

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can view groups they created" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;

-- Temporarily disable RLS for INSERT operations
-- We'll use a trigger or function to handle security instead
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS but only for SELECT, UPDATE, DELETE
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create simple policies that don't check group_members
CREATE POLICY "Users can view groups they created"
  ON groups FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- For INSERT, we'll use the function with SECURITY DEFINER
-- Or we can create a policy that checks if user is authenticated
CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);



