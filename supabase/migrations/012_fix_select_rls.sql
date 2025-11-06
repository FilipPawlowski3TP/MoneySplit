-- Fix SELECT RLS: Create SECURITY DEFINER functions to bypass RLS
-- This will allow users to see groups they created even if auth.uid() doesn't work

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_user_groups_safe(UUID);
DROP FUNCTION IF EXISTS get_group_by_id_safe(UUID, UUID);

-- Create function to get user's groups (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_groups_safe(user_id_param UUID)
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
  -- Return groups where user is creator
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.created_by,
    g.invite_code,
    g.created_at,
    g.updated_at
  FROM groups g
  WHERE g.created_by = user_id_param
  
  UNION
  
  -- Also return groups where user is a member
  SELECT 
    g.id,
    g.name,
    g.created_by,
    g.invite_code,
    g.created_at,
    g.updated_at
  FROM groups g
  INNER JOIN group_members gm ON gm.group_id = g.id
  WHERE gm.user_id = user_id_param;
END;
$$;

-- Create function to get group by ID (bypasses RLS)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_groups_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_by_id_safe(UUID, UUID) TO authenticated;






