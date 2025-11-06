# Database Setup & Usage Guide

## ✅ What's Been Created

### 1. SQL Schema (`supabase/migrations/001_initial_schema.sql`)
- Complete database schema with all tables
- Row Level Security (RLS) policies
- Automatic profile creation trigger
- Updated timestamp triggers

### 2. TypeScript Types (`types/database.types.ts`)
- Full type definitions for all tables
- Type-safe database operations

### 3. CRUD Functions (`lib/db/`)
- `profiles.ts` - Profile management
- `groups.ts` - Group management
- `expenses.ts` - Expense management
- `balances.ts` - Balance calculations

### 4. API Routes (`app/api/`)
- `/api/groups` - Group CRUD operations
- `/api/groups/[id]` - Individual group operations
- `/api/expenses` - Expense operations

## 🚀 Quick Start

### Step 1: Run SQL Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL
4. Verify tables were created in Table Editor

### Step 2: Test Profile Creation

When a user signs up, a profile is automatically created via trigger.

### Step 3: Use the Functions

```typescript
// In Server Components
import { createGroup, getUserGroups } from '@/lib/db/groups'
import { createExpense } from '@/lib/db/expenses'
import { calculateGroupBalances } from '@/lib/db/balances'

// Create a group
const group = await createGroup('Trip to Spain')

// Get user's groups
const groups = await getUserGroups()

// Create an expense
const expense = await createExpense({
  groupId: group.id,
  payerId: userId,
  amount: 100,
  description: 'Dinner',
  splits: [
    { userId: 'user-1', shareAmount: 50 },
    { userId: 'user-2', shareAmount: 50 },
  ],
})

// Calculate balances
const balances = await calculateGroupBalances(group.id)
```

## 📚 Database Schema

### Tables

1. **profiles** - User profiles linked to auth.users
2. **groups** - Expense groups
3. **group_members** - Many-to-many relationship
4. **expenses** - Individual expenses
5. **expense_splits** - How expense is split among users

### Relationships

```
auth.users → profiles (1:1)
groups → group_members → profiles (many-to-many)
groups → expenses → expense_splits → profiles
```

## 🔧 Available Functions

### Profiles (`lib/db/profiles.ts`)
- `getCurrentProfile()` - Get current user's profile
- `getProfileById(userId)` - Get profile by ID
- `updateProfile(updates)` - Update current profile
- `searchProfiles(query)` - Search profiles

### Groups (`lib/db/groups.ts`)
- `createGroup(name)` - Create new group
- `getUserGroups()` - Get all user's groups
- `getGroupById(id)` - Get group with members
- `updateGroup(id, updates)` - Update group
- `deleteGroup(id)` - Delete group
- `addGroupMember(groupId, userId)` - Add member
- `removeGroupMember(groupId, userId)` - Remove member

### Expenses (`lib/db/expenses.ts`)
- `createExpense(input)` - Create expense with splits
- `getExpenseById(id)` - Get expense with splits
- `getGroupExpenses(groupId)` - Get all expenses for group
- `updateExpense(id, updates)` - Update expense
- `updateExpenseSplits(expenseId, splits)` - Update splits
- `deleteExpense(id)` - Delete expense

### Balances (`lib/db/balances.ts`)
- `calculateGroupBalances(groupId)` - Calculate detailed balances
- `getSimplifiedBalances(groupId)` - Get "who owes whom" summary

## 📝 Example Usage

See `examples/example-usage.tsx` for complete examples of:
- Server Components
- Client Components
- API Routes
- Direct Supabase client usage

## 🔒 Security

All tables have Row Level Security (RLS) enabled:
- Users can only see data from groups they belong to
- Users can only modify their own data
- Group creators have full control over their groups

## 🎯 Next Steps

1. Run the SQL migration
2. Test user registration (profile auto-creates)
3. Create a group
4. Add expenses
5. Calculate balances

See `SUPABASE_SETUP.md` for detailed setup instructions.






