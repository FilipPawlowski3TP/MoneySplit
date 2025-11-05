-- Fix expense creation: Create SECURITY DEFINER function to bypass RLS
-- This will allow users to create expenses in groups they belong to

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_expense_safe(
  UUID, -- group_id
  UUID, -- payer_id
  DECIMAL,
  TEXT,
  DATE,
  UUID -- user_id (to verify access)
);

-- Create function to create expense with splits (bypasses RLS)
CREATE OR REPLACE FUNCTION create_expense_safe(
  group_id_param UUID,
  payer_id_param UUID,
  amount_param DECIMAL,
  description_param TEXT,
  date_param DATE,
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
DECLARE
  new_expense RECORD;
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
    RAISE EXCEPTION 'User does not have access to this group';
  END IF;

  -- Create expense bypassing RLS
  INSERT INTO expenses (
    group_id,
    payer_id,
    amount,
    description,
    date
  )
  VALUES (
    group_id_param,
    payer_id_param,
    amount_param,
    description_param,
    date_param
  )
  RETURNING * INTO new_expense;

  -- Return the created expense
  RETURN QUERY
  SELECT 
    new_expense.id,
    new_expense.group_id,
    new_expense.payer_id,
    new_expense.amount,
    new_expense.description,
    new_expense.date,
    new_expense.created_at,
    new_expense.updated_at;
END;
$$;

-- Create function to create expense splits (bypasses RLS)
CREATE OR REPLACE FUNCTION create_expense_splits_safe(
  expense_id_param UUID,
  splits_data TEXT,
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
DECLARE
  split_item JSONB;
  new_split RECORD;
BEGIN
  -- Verify user has access to this expense's group
  IF NOT EXISTS (
    SELECT 1 FROM expenses e
    INNER JOIN groups g ON g.id = e.group_id
    WHERE e.id = expense_id_param
    AND (
      g.created_by = user_id_param
      OR EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = g.id
        AND gm.user_id = user_id_param
      )
    )
  ) THEN
    RAISE EXCEPTION 'User does not have access to this expense';
  END IF;

    -- Insert all splits
    FOR split_item IN SELECT * FROM jsonb_array_elements(splits_data::jsonb)
    LOOP
      INSERT INTO expense_splits (
        expense_id,
        user_id,
        share_amount
      )
      VALUES (
        expense_id_param,
        (split_item->>'userId')::UUID,
        ((split_item->>'shareAmount')::text)::DECIMAL
      )
      RETURNING * INTO new_split;

      RETURN QUERY
      SELECT 
        new_split.id,
        new_split.expense_id,
        new_split.user_id,
        new_split.share_amount,
        new_split.created_at;
    END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_expense_safe(UUID, UUID, DECIMAL, TEXT, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_expense_splits_safe(UUID, TEXT, UUID) TO authenticated;

