-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view all profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(group_id, user_id)
);

-- Enable Row Level Security for groups (after group_members is created)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view groups they belong to
CREATE POLICY "Users can view groups they belong to"
  ON groups FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Create policy: Users can create groups
CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Create policy: Group creators can update their groups
CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid());

-- Create policy: Group creators can delete their groups
CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- Enable Row Level Security for group_members
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view group members of groups they belong to
CREATE POLICY "Users can view group members of their groups"
  ON group_members FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Create policy: Group creators can add members
CREATE POLICY "Group creators can add members"
  ON group_members FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- Create policy: Group creators can remove members
CREATE POLICY "Group creators can remove members"
  ON group_members FOR DELETE
  USING (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    )
  );

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view expenses of groups they belong to
CREATE POLICY "Users can view expenses of their groups"
  ON expenses FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Create policy: Users can create expenses in their groups
CREATE POLICY "Users can create expenses in their groups"
  ON expenses FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

-- Create policy: Expense payers can update their expenses
CREATE POLICY "Expense payers can update their expenses"
  ON expenses FOR UPDATE
  USING (payer_id = auth.uid());

-- Create policy: Expense payers can delete their expenses
CREATE POLICY "Expense payers can delete their expenses"
  ON expenses FOR DELETE
  USING (payer_id = auth.uid());

-- Create expense_splits table
CREATE TABLE IF NOT EXISTS expense_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_amount DECIMAL(10, 2) NOT NULL CHECK (share_amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(expense_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view expense splits of their groups
CREATE POLICY "Users can view expense splits of their groups"
  ON expense_splits FOR SELECT
  USING (
    expense_id IN (
      SELECT id FROM expenses WHERE group_id IN (
        SELECT id FROM groups WHERE created_by = auth.uid()
      ) OR group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Create policy: Users can create expense splits for expenses in their groups
CREATE POLICY "Users can create expense splits for their groups"
  ON expense_splits FOR INSERT
  WITH CHECK (
    expense_id IN (
      SELECT id FROM expenses WHERE group_id IN (
        SELECT id FROM groups WHERE created_by = auth.uid()
      ) OR group_id IN (
        SELECT group_id FROM group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Create policy: Expense payers can update expense splits
CREATE POLICY "Expense payers can update expense splits"
  ON expense_splits FOR UPDATE
  USING (
    expense_id IN (
      SELECT id FROM expenses WHERE payer_id = auth.uid()
    )
  );

-- Create policy: Expense payers can delete expense splits
CREATE POLICY "Expense payers can delete expense splits"
  ON expense_splits FOR DELETE
  USING (
    expense_id IN (
      SELECT id FROM expenses WHERE payer_id = auth.uid()
    )
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

