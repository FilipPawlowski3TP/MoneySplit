-- Working solution: Create function that bypasses RLS completely
-- This will fix the recursion issue

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_group_safe(TEXT, UUID, TEXT);

-- Create the function with proper SECURITY DEFINER
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
  -- Insert the group bypassing RLS completely
  INSERT INTO groups (name, created_by, invite_code)
  VALUES (group_name, creator_id, invite_code_value)
  RETURNING id INTO new_group_id;
  
  -- Add creator as a member (also bypasses RLS)
  INSERT INTO group_members (group_id, user_id)
  VALUES (new_group_id, creator_id);
  
  RETURN new_group_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_group_safe(TEXT, UUID, TEXT) TO authenticated;

-- Now fix the policies to be very simple
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can view groups they created" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON groups;

-- Simple SELECT policy - only show groups you created
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

-- For INSERT, we don't need a policy because we use the function
-- But let's create a permissive one just in case
CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);



