-- Add functions for deleting groups and joining by invite code
-- These functions bypass RLS for security

-- Function to delete a group (bypasses RLS)
CREATE OR REPLACE FUNCTION delete_group_safe(group_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  group_creator UUID;
BEGIN
  -- Check if user is the creator
  SELECT created_by INTO group_creator
  FROM groups
  WHERE id = group_id_param;
  
  IF group_creator IS NULL THEN
    RETURN FALSE; -- Group doesn't exist
  END IF;
  
  IF group_creator != user_id_param THEN
    RETURN FALSE; -- User is not the creator
  END IF;
  
  -- Delete the group (cascade will delete members and expenses)
  DELETE FROM groups WHERE id = group_id_param;
  
  RETURN TRUE;
END;
$$;

-- Function to find group by invite code (bypasses RLS)
CREATE OR REPLACE FUNCTION get_group_by_invite_code_safe(invite_code_param TEXT)
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
  -- Return group with matching invite code
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.created_by,
    g.invite_code,
    g.created_at,
    g.updated_at
  FROM groups g
  WHERE g.invite_code = UPPER(invite_code_param)
  LIMIT 1;
END;
$$;

-- Function to join group by invite code (bypasses RLS)
CREATE OR REPLACE FUNCTION join_group_by_code_safe(invite_code_param TEXT, user_id_param UUID)
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
DECLARE
  found_group RECORD;
  existing_member RECORD;
BEGIN
  -- Find group by invite code (use table alias to avoid ambiguity)
  SELECT g.* INTO found_group
  FROM groups g
  WHERE g.invite_code = UPPER(invite_code_param)
  LIMIT 1;
  
  IF found_group IS NULL THEN
    RETURN; -- Group not found
  END IF;
  
  -- Check if user is already a member
  SELECT * INTO existing_member
  FROM group_members
  WHERE group_id = found_group.id
  AND user_id = user_id_param
  LIMIT 1;
  
  -- If not a member, add them
  IF existing_member IS NULL THEN
    INSERT INTO group_members (group_id, user_id)
    VALUES (found_group.id, user_id_param);
  END IF;
  
  -- Return the group
  RETURN QUERY
  SELECT 
    found_group.id,
    found_group.name,
    found_group.created_by,
    found_group.invite_code,
    found_group.created_at,
    found_group.updated_at;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_group_safe(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_by_invite_code_safe(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION join_group_by_code_safe(TEXT, UUID) TO authenticated;

