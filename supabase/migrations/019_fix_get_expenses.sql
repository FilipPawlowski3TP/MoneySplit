-- Fix expense fetching: Create SECURITY DEFINER function to bypass RLS
-- This will allow users to view expenses of groups they belong to

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_group_expenses_safe(UUID, UUID);

-- Create function to get all expenses for a group (bypasses RLS)
CREATE OR REPLACE FUNCTION get_group_expenses_safe(
  group_id_param UUID,
  user_id_param UUID
)
RETURNS TABLE (
  id UUID,
  group_id UUID,
  payer_id UUID,
  amount DECIMAL,
  description TEXT,
  date DATE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has access to this group (is creator or member)
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

  -- Return all expenses for the group
  RETURN QUERY
  SELECT 
    e.id,
    e.group_id,
    e.payer_id,
    e.amount,
    e.description,
    e.date,
    e.created_at,
    e.updated_at
  FROM expenses e
  WHERE e.group_id = group_id_param
  ORDER BY e.date DESC, e.created_at DESC;
END;
$$;

-- Create function to get expense splits for a group (bypasses RLS)
CREATE OR REPLACE FUNCTION get_group_expense_splits_safe(
  group_id_param UUID,
  user_id_param UUID
)
RETURNS TABLE (
  id UUID,
  expense_id UUID,
  user_id UUID,
  share_amount DECIMAL,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user has access to this group (is creator or member)
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

  -- Return all expense splits for expenses in this group
  RETURN QUERY
  SELECT 
    es.id,
    es.expense_id,
    es.user_id,
    es.share_amount,
    es.created_at
  FROM expense_splits es
  INNER JOIN expenses e ON e.id = es.expense_id
  WHERE e.group_id = group_id_param;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_group_expenses_safe(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_expense_splits_safe(UUID, UUID) TO authenticated;






