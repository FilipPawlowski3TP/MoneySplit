-- Add function to delete expenses (bypasses RLS)
-- Only the payer can delete their expense

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS delete_expense_safe(UUID, UUID);

-- Create function to delete expense (bypasses RLS)
CREATE OR REPLACE FUNCTION delete_expense_safe(
  expense_id_param UUID,
  user_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expense_record RECORD;
BEGIN
  -- Get the expense to verify ownership
  SELECT * INTO expense_record
  FROM expenses
  WHERE id = expense_id_param;

  -- If expense doesn't exist, return false
  IF expense_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verify user is the payer
  IF expense_record.payer_id != user_id_param THEN
    RAISE EXCEPTION 'Only the expense payer can delete this expense';
  END IF;

  -- Delete expense (cascade will delete splits automatically)
  DELETE FROM expenses
  WHERE id = expense_id_param;

  RETURN TRUE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_expense_safe(UUID, UUID) TO authenticated;






