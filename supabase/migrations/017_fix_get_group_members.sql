-- Fix get_group_by_id_safe to also return all members of the group
-- This will allow fetching all members without RLS issues

-- Drop existing function
DROP FUNCTION IF EXISTS get_group_by_id_safe(UUID, UUID);

-- Create improved function that returns group with members
CREATE OR REPLACE FUNCTION get_group_by_id_safe(group_id_param UUID, user_id_param UUID)
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
BEGIN
  -- Return group if user is creator or member
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.created_by,
    g.invite_code,
    g.created_at,
    g.updated_at
  FROM groups g
  WHERE g.id = group_id_param
  AND (
    g.created_by = user_id_param
    OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = g.id
      AND gm.user_id = user_id_param
    )
  )
  LIMIT 1;
END;
$$;

-- Create function to get all members of a group (bypasses RLS)
CREATE OR REPLACE FUNCTION get_group_members_safe(group_id_param UUID, user_id_param UUID)
RETURNS TABLE (
  user_id UUID,
  group_id UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has access to this group
  IF NOT EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_id_param
    AND (
      g.created_by = user_id_param
      OR EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = g.id
        AND gm.user_id = user_id_param
      )
    )
  ) THEN
    RETURN; -- No access, return empty
  END IF;

  -- Return all members of the group
  RETURN QUERY
  SELECT 
    gm.user_id,
    gm.group_id,
    gm.created_at
  FROM group_members gm
  WHERE gm.group_id = group_id_param;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_group_by_id_safe(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_members_safe(UUID, UUID) TO authenticated;






