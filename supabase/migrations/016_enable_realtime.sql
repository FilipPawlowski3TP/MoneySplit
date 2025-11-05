-- Enable Realtime for expenses and expense_splits tables
-- This allows real-time updates when expenses are added or modified

-- Enable Realtime for expenses table
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

-- Enable Realtime for expense_splits table
ALTER PUBLICATION supabase_realtime ADD TABLE expense_splits;



