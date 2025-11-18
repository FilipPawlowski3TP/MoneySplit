import { Database } from '@/types/database.types'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// Type aliases for easier use
export type Profile = Tables<'profiles'>
export type Group = Tables<'groups'>
export type GroupMember = Tables<'group_members'>
export type Expense = Tables<'expenses'>
export type ExpenseSplit = Tables<'expense_splits'>

// Extended types with relations
export type GroupWithMembers = Group & {
  members: (GroupMember & { profile: Profile })[]
  created_by_profile: Profile
}

export type ExpenseWithSplits = Expense & {
  splits: (ExpenseSplit & { user: Profile })[]
  payer: Profile
  group: Group
}

export type GroupWithExpenses = Group & {
  expenses: ExpenseWithSplits[]
  members: (GroupMember & { profile: Profile })[]
}








