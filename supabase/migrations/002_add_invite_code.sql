-- Add invite_code column to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Create index on invite_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);

-- Drop existing policy for group_members INSERT if it exists
DROP POLICY IF EXISTS "Group creators can add members" ON group_members;

-- Create policy: Group creators can add members
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- Create policy: Users can join groups by invite code
-- This allows users to join groups using invite codes
CREATE POLICY "Users can join groups by invite code"
  ON group_members FOR INSERT
  WITH CHECK (
    -- Allow if user is joining themselves and group has invite_code
    user_id = auth.uid() AND
    group_id IN (
      SELECT id FROM groups WHERE invite_code IS NOT NULL
    )
  );

