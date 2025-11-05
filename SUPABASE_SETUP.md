# Supabase Database Setup Guide

## Step 1: Run SQL Migration

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run the SQL in the SQL Editor

This will create:
- `profiles` table (linked to auth.users)
- `groups` table
- `group_members` table
- `expenses` table
- `expense_splits` table
- Row Level Security (RLS) policies
- Automatic profile creation trigger
- Updated timestamp triggers

## Step 2: Verify Tables

After running the migration, verify the tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see all 5 tables:
   - `profiles`
   - `groups`
   - `group_members`
   - `expenses`
   - `expense_splits`

## Step 3: Test RLS Policies

The migration includes Row Level Security policies that:
- Allow users to view their own data and group data they belong to
- Allow users to create/update/delete their own resources
- Prevent unauthorized access

## Step 4: Test Profile Creation

When a user signs up:
1. A profile is automatically created via the `handle_new_user()` trigger
2. The profile is linked to `auth.users` via the `id` field
3. You can verify this in the `profiles` table after user registration

## Database Schema

### profiles
- `id` (UUID, FK → auth.users.id)
- `name` (TEXT)
- `email` (TEXT, UNIQUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### groups
- `id` (UUID, PK)
- `name` (TEXT)
- `created_by` (UUID, FK → auth.users.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### group_members
- `id` (UUID, PK)
- `group_id` (UUID, FK → groups.id)
- `user_id` (UUID, FK → auth.users.id)
- `created_at` (TIMESTAMP)
- UNIQUE(group_id, user_id)

### expenses
- `id` (UUID, PK)
- `group_id` (UUID, FK → groups.id)
- `payer_id` (UUID, FK → auth.users.id)
- `amount` (DECIMAL(10,2))
- `description` (TEXT)
- `date` (DATE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### expense_splits
- `id` (UUID, PK)
- `expense_id` (UUID, FK → expenses.id)
- `user_id` (UUID, FK → auth.users.id)
- `share_amount` (DECIMAL(10,2))
- `created_at` (TIMESTAMP)
- UNIQUE(expense_id, user_id)

## TypeScript Types

The TypeScript types are automatically generated in `types/database.types.ts`. These types are used throughout the application for type safety.

## Using the Database Functions

See `examples/example-usage.tsx` for comprehensive examples of how to use the CRUD functions in:
- Server Components
- Client Components
- API Routes

## Next Steps

After setting up the database:
1. Test user registration (profile should auto-create)
2. Test creating a group
3. Test adding expenses
4. Test balance calculations



