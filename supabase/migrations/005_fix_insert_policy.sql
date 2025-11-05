-- Fix INSERT policy for groups
-- The issue is that the INSERT policy is too strict or has issues with SECURITY DEFINER functions

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create groups" ON groups;

-- Create a simpler INSERT policy that doesn't use any functions
-- This policy should allow any authenticated user to create a group
CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() = created_by
  );

-- Also ensure the SELECT policy works correctly
-- Drop and recreate to be safe
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;

CREATE POLICY "Users can view groups they belong to"
  ON groups FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = groups.id 
      AND gm.user_id = auth.uid()
    )
  );



