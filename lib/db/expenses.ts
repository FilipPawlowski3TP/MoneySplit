import { createClient } from '@/lib/supabase/server'
import { Expense, ExpenseWithSplits, ExpenseSplit } from '@/lib/supabase/types'
import { cookies } from 'next/headers'

interface CreateExpenseInput {
  groupId: string
  payerId: string
  amount: number
  description: string
  date?: string
  splits: Array<{
    userId: string
    shareAmount: number
  }>
}

/**
 * Create a new expense with splits
 */
export async function createExpense(
  input: CreateExpenseInput
): Promise<ExpenseWithSplits | null> {
  const supabase = await createClient()

  // Get user from cookie as fallback (same as middleware)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  let user = null
  
  // Try to get user from Supabase first
  const {
    data: { user: fetchedUser },
  } = await supabase.auth.getUser()

  user = fetchedUser

  // If getUser() fails but we have a cookie with session data, use cookie data
  if (!user && authCookie) {
    try {
      const cookieValue = JSON.parse(authCookie.value)
      if (cookieValue.user && cookieValue.access_token) {
        user = cookieValue.user
      }
    } catch (e) {
      // Cookie parsing failed, ignore
    }
  }

  if (!user) {
    console.error('[createExpense] No user found')
    return null
  }

  console.log('[createExpense] User found:', user.id)

  // Try to use SECURITY DEFINER function first (bypasses RLS)
  try {
    const { data: expenseData, error: expenseError } = await supabase
      .rpc('create_expense_safe', {
        group_id_param: input.groupId,
        payer_id_param: input.payerId,
        amount_param: input.amount,
        description_param: input.description,
        date_param: input.date || new Date().toISOString().split('T')[0],
        user_id_param: user.id,
      })

    if (expenseError || !expenseData || expenseData.length === 0) {
      console.error('[createExpense] Function error:', expenseError)
      if (expenseError?.code === 'PGRST202') {
        console.error('[createExpense] Function not found - migration 018_fix_expense_creation.sql may not have been run')
      }
      throw new Error('Function failed')
    }

    const expense = expenseData[0] as any

    // Create expense splits using SECURITY DEFINER function
    const splitsJson = JSON.stringify(
      input.splits.map((split) => ({
        userId: split.userId,
        shareAmount: split.shareAmount,
      }))
    )

    const { data: splitsData, error: splitsError } = await supabase
      .rpc('create_expense_splits_safe', {
        expense_id_param: expense.id,
        splits_data: splitsJson,
        user_id_param: user.id,
      })

    if (splitsError) {
      console.error('[createExpense] Splits function error:', splitsError)
      // Delete expense if splits fail
      try {
        await supabase.from('expenses').delete().eq('id', expense.id)
      } catch (deleteError) {
        console.error('[createExpense] Error deleting expense after splits failure:', deleteError)
      }
      return null
    }

    // Fetch profiles for all users (payer + split participants)
    const userIds = [input.payerId, ...input.splits.map(s => s.userId)]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds as any)

    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    // Build expense object with splits and profiles
    // We can't use getExpenseById here because it might be blocked by RLS
    return {
      ...expense,
      splits: ((splitsData as any) || []).map((split: any) => ({
        ...split,
        user: profilesMap.get(split.user_id) || ({} as any),
      })),
      payer: profilesMap.get(expense.payer_id) || ({} as any),
      group: {} as any,
    } as ExpenseWithSplits
  } catch (e) {
    console.log('[createExpense] Exception using function, trying direct insert:', e)
    
    // Fallback to direct insert (may be blocked by RLS)
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: input.groupId,
        payer_id: input.payerId,
        amount: input.amount,
        description: input.description,
        date: input.date || new Date().toISOString().split('T')[0],
      } as any)
      .select()
      .single()

    if (expenseError || !expense) {
      console.error('[createExpense] Error creating expense:', expenseError)
      return null
    }

    const expenseData = expense as any

    // Create expense splits
    const splitsData = input.splits.map((split) => ({
      expense_id: expenseData.id,
      user_id: split.userId,
      share_amount: split.shareAmount,
    }))

    const { data: splits, error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splitsData as any)
      .select()

    if (splitsError) {
      console.error('[createExpense] Error creating expense splits:', splitsError)
      // Delete expense if splits fail
      await supabase.from('expenses').delete().eq('id', expenseData.id as any)
      return null
    }

    // Fetch profiles for all users (payer + split participants)
    const userIds = [input.payerId, ...input.splits.map(s => s.userId)]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds as any)

    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    return {
      ...expenseData,
      splits: ((splits as any) || []).map((split: any) => ({
        ...split,
        user: profilesMap.get(split.user_id) || ({} as any),
      })),
      payer: profilesMap.get(expenseData.payer_id) || ({} as any),
      group: {} as any,
    } as ExpenseWithSplits
  }
}

/**
 * Get expense by ID with splits
 */
export async function getExpenseById(
  expenseId: string
): Promise<ExpenseWithSplits | null> {
  const supabase = await createClient()

  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', expenseId as any)
    .single()

  if (expenseError || !expense) {
    console.error('Error fetching expense:', expenseError)
    return null
  }

  const expenseData = expense as any

  // Get splits
  const { data: splits, error: splitsError } = await supabase
    .from('expense_splits')
    .select('*')
    .eq('expense_id', expenseId as any)

  if (splitsError) {
    console.error('Error fetching expense splits:', splitsError)
  }

  // Get all unique user IDs
  const userIds = new Set([
    expenseData.payer_id,
    ...((splits as any) || []).map((s: any) => s.user_id),
  ])

  // Get profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', Array.from(userIds) as any)

  const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

  // Get group
  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', expenseData.group_id as any)
    .single()

  return {
    ...expenseData,
    splits: ((splits as any) || []).map((split: any) => ({
      ...split,
      user: profilesMap.get(split.user_id) || ({} as any),
    })),
    payer: profilesMap.get(expenseData.payer_id) || ({} as any),
    group: (group as any) || ({} as any),
  }
}

/**
 * Get all expenses for a group
 */
export async function getGroupExpenses(
  groupId: string
): Promise<ExpenseWithSplits[]> {
  const supabase = await createClient()

  // Get current user (with cookie fallback)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  let user = null
  
  const {
    data: { user: fetchedUser },
  } = await supabase.auth.getUser()

  user = fetchedUser

  if (!user && authCookie) {
    try {
      const cookieValue = JSON.parse(authCookie.value)
      if (cookieValue.user && cookieValue.access_token) {
        user = cookieValue.user
      }
    } catch (e) {
      // Cookie parsing failed, ignore
    }
  }

  if (!user) {
    console.error('[getGroupExpenses] No user found')
    return []
  }

  // Try to use SECURITY DEFINER function first (bypasses RLS)
  try {
    const { data: expensesData, error: expensesError } = await supabase
      .rpc('get_group_expenses_safe', {
        group_id_param: groupId,
        user_id_param: user.id,
      })

    if (expensesError || !expensesData) {
      console.error('[getGroupExpenses] Function error:', expensesError)
      throw new Error('Function failed')
    }

    if (expensesData.length === 0) {
      return []
    }

    // Get splits using SECURITY DEFINER function
    const { data: splitsData, error: splitsError } = await supabase
      .rpc('get_group_expense_splits_safe', {
        group_id_param: groupId,
        user_id_param: user.id,
      })

    if (splitsError) {
      console.error('[getGroupExpenses] Splits function error:', splitsError)
    }

    // Get all unique user IDs
    const expensesArray = (expensesData as any) || []
    const splitsArray = (splitsData as any) || []
    const userIds = new Set([
      ...expensesArray.map((e: any) => e.payer_id),
      ...splitsArray.map((s: any) => s.user_id),
    ])

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', Array.from(userIds) as any)

    const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    // Build result
    return expensesArray.map((expense: any) => ({
      ...expense,
      splits:
        splitsArray
          .filter((s: any) => s.expense_id === expense.id)
          .map((split: any) => ({
            ...split,
            user: profilesMap.get(split.user_id) || ({} as any),
          })),
      payer: profilesMap.get(expense.payer_id) || ({} as any),
      group: {} as any,
    }))
  } catch (e) {
    console.log('[getGroupExpenses] Exception using function, trying direct query:', e)
  }

  // Fallback to direct query (may be blocked by RLS)
  const { data: expenses, error: expensesError } = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', groupId as any)
    .order('date', { ascending: false })

  if (expensesError) {
    console.error('Error fetching expenses:', expensesError)
    return []
  }

  if (!expenses || expenses.length === 0) {
    return []
  }

  const expensesArray = expenses as any[]

  // Fetch all splits and related data
  const expenseIds = expensesArray.map((e: any) => e.id)
  
  const { data: splits } = await supabase
    .from('expense_splits')
    .select('*')
    .in('expense_id', expenseIds as any)

  // Get all unique user IDs
  const splitsArray = (splits as any) || []
  const userIds = new Set([
    ...expensesArray.map((e: any) => e.payer_id),
    ...splitsArray.map((s: any) => s.user_id),
  ])

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', Array.from(userIds) as any)

  const profilesMap = new Map((profiles || []).map((p: any) => [p.id, p]))

  // Build result
  return expensesArray.map((expense: any) => ({
    ...expense,
    splits:
      splitsArray
        .filter((s: any) => s.expense_id === expense.id)
        .map((split: any) => ({
          ...split,
          user: profilesMap.get(split.user_id) || ({} as any),
        })),
    payer: profilesMap.get(expense.payer_id) || ({} as any),
    group: {} as any, // Group info can be fetched separately if needed
  }))
}

/**
 * Update expense
 */
export async function updateExpense(
  expenseId: string,
  updates: Partial<Pick<Expense, 'amount' | 'description' | 'date'>>
): Promise<Expense | null> {
  const supabase = await createClient()

  const { data: expense, error } = await supabase
    .from('expenses')
    .update(updates as any)
    .eq('id', expenseId as any)
    .select()
    .single()

  if (error || !expense) {
    console.error('Error updating expense:', error)
    return null
  }

  return expense as unknown as Expense
}

/**
 * Delete expense
 */
export async function deleteExpense(expenseId: string): Promise<boolean> {
  const supabase = await createClient()

  // Get current user (with cookie fallback)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  let user = null
  
  const {
    data: { user: fetchedUser },
  } = await supabase.auth.getUser()

  user = fetchedUser

  if (!user && authCookie) {
    try {
      const cookieValue = JSON.parse(authCookie.value)
      if (cookieValue.user && cookieValue.access_token) {
        user = cookieValue.user
      }
    } catch (e) {
      // Cookie parsing failed, ignore
    }
  }

  if (!user) {
    console.error('[deleteExpense] No user found')
    return false
  }

  // Try to use SECURITY DEFINER function first (bypasses RLS)
  try {
    const { data, error } = await supabase
      .rpc('delete_expense_safe', {
        expense_id_param: expenseId,
        user_id_param: user.id,
      })

    if (error) {
      console.error('[deleteExpense] Function error:', error)
      throw new Error('Function failed')
    }

    return (data as any) === true
  } catch (e) {
    console.log('[deleteExpense] Exception using function, trying direct delete:', e)
    
    // Fallback to direct delete (may be blocked by RLS)
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId as any)
      .eq('payer_id', user.id as any)

    if (error) {
      console.error('[deleteExpense] Error deleting expense:', error)
      return false
    }

    return true
  }
}
