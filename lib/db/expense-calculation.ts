/**
 * Integration functions for expense calculation with Supabase data
 */

import { getGroupExpenses } from './expenses'
import { getGroupById } from './groups'
import { ExpenseWithSplits } from '@/lib/supabase/types'
import {
  addExpense,
  calculateExpenseResult,
  recalculateBalancesRealTime,
  type ExpenseInput,
  type ExpenseCalculationResult,
  type Expense,
} from '@/lib/expense-calculation'

/**
 * Convert Supabase expense format to calculation format
 */
function convertToCalculationExpense(expense: ExpenseWithSplits): Expense {
  return {
    id: expense.id,
    payerId: expense.payer_id,
    amount: Number(expense.amount),
    description: expense.description,
    date: expense.date,
    participants: expense.splits.map((split) => ({
      userId: split.user_id,
      shareAmount: Number(split.share_amount),
    })),
  }
}

/**
 * Calculate balances for a group using Supabase data
 */
export async function calculateGroupBalancesWithCalculation(
  groupId: string
): Promise<ExpenseCalculationResult> {
  // Fetch expenses from Supabase
  const supabaseExpenses = await getGroupExpenses(groupId)

  // Convert to calculation format
  const expenses = supabaseExpenses.map(convertToCalculationExpense)

  // Get user names for better display
  const group = await getGroupById(groupId)
  const userNames = new Map<string, { name: string; email?: string }>()

  if (group) {
    group.members.forEach((member) => {
      if (member.profile) {
        userNames.set(member.profile.id, {
          name: member.profile.name,
          email: member.profile.email,
        })
      }
    })
  }

  // Calculate result
  return calculateExpenseResult(expenses, userNames)
}

/**
 * Add expense to group and calculate balances
 */
export async function addExpenseToGroup(
  groupId: string,
  expenseInput: ExpenseInput
): Promise<{
  isValid: boolean
  errors: string[]
  calculationResult?: ExpenseCalculationResult
}> {
  // Get existing expenses
  const supabaseExpenses = await getGroupExpenses(groupId)
  const expenses = supabaseExpenses.map(convertToCalculationExpense)

  // Get user names
  const group = await getGroupById(groupId)
  const userNames = new Map<string, { name: string; email?: string }>()

  if (group) {
    group.members.forEach((member) => {
      if (member.profile) {
        userNames.set(member.profile.id, {
          name: member.profile.name,
          email: member.profile.email,
        })
      }
    })
  }

  // Add expense using calculation logic
  const result = addExpense(expenses, expenseInput, userNames)

  if (!result.isValid) {
    return {
      isValid: false,
      errors: result.errors,
    }
  }

  return {
    isValid: true,
    errors: [],
    calculationResult: result.calculationResult,
  }
}

/**
 * Recalculate balances in real-time for a group
 */
export async function recalculateGroupBalancesRealTime(
  groupId: string,
  currentBalances: any[],
  newExpense: ExpenseInput
): Promise<ExpenseCalculationResult> {
  // Get user names
  const group = await getGroupById(groupId)
  const userNames = new Map<string, { name: string; email?: string }>()

  if (group) {
    group.members.forEach((member) => {
      if (member.profile) {
        userNames.set(member.profile.id, {
          name: member.profile.name,
          email: member.profile.email,
        })
      }
    })
  }

  // Convert current balances format
  const balances = currentBalances.map((b) => ({
    userId: b.userId || b.user_id,
    userName: b.userName || b.user_name,
    userEmail: b.userEmail || b.user_email,
    totalPaid: b.totalPaid || b.total_paid || 0,
    totalOwed: b.totalOwed || b.total_owed || 0,
    netBalance: b.netBalance || b.net_balance || 0,
  }))

  // Recalculate
  return recalculateBalancesRealTime(balances, newExpense, userNames)
}

