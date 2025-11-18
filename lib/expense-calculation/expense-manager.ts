/**
 * Main expense manager that combines all calculation logic
 * This is the main interface for expense operations
 */

import {
  Expense,
  ExpenseInput,
  UserBalance,
  SimplifiedDebt,
  ExpenseCalculationResult,
} from './types'
import { validateExpenseInput, normalizeExpenseShares } from './validation'
import { calculateBalances, recalculateBalances } from './balance'
import { simplifyDebts, calculateDebtSummary } from './simplification'

/**
 * Add an expense and return updated calculation result
 */
export function addExpense(
  expenses: Expense[],
  newExpense: ExpenseInput,
  userNames?: Map<string, { name: string; email?: string }>
): {
  isValid: boolean
  errors: string[]
  updatedExpenses: Expense[]
  calculationResult?: ExpenseCalculationResult
} {
  // Validate expense input
  const validation = validateExpenseInput(newExpense)

  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors,
      updatedExpenses: expenses,
    }
  }

  // Normalize share amounts to handle rounding
  const normalizedParticipants = normalizeExpenseShares(
    newExpense.amount,
    newExpense.participants
  )

  // Create expense object
  const expense: Expense = {
    payerId: newExpense.payerId,
    amount: newExpense.amount,
    description: newExpense.description,
    date: newExpense.date || new Date().toISOString().split('T')[0],
    participants: normalizedParticipants,
  }

  // Add to expenses list
  const updatedExpenses = [...expenses, expense]

  // Calculate balances
  const balances = calculateBalances(updatedExpenses, userNames)

  // Simplify debts
  const simplifiedDebts = simplifyDebts(balances)

  // Calculate summary
  const totalExpenses = updatedExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  )

  const calculationResult: ExpenseCalculationResult = {
    balances,
    simplifiedDebts,
    totalExpenses,
    isValid: true,
    errors: [],
  }

  return {
    isValid: true,
    errors: [],
    updatedExpenses,
    calculationResult,
  }
}

/**
 * Calculate complete expense calculation result from expenses list
 */
export function calculateExpenseResult(
  expenses: Expense[],
  userNames?: Map<string, { name: string; email?: string }>
): ExpenseCalculationResult {
  // Validate all expenses
  const validation = validateExpenseInput as any
  const errors: string[] = []

  expenses.forEach((expense, index) => {
    const result = validateExpenseInput({
      payerId: expense.payerId,
      amount: expense.amount,
      description: expense.description,
      participants: expense.participants,
      date: expense.date,
    })

    if (!result.isValid) {
      errors.push(...result.errors.map((err) => `Expense ${index + 1}: ${err}`))
    }
  })

  // Calculate balances
  const balances = calculateBalances(expenses, userNames)

  // Simplify debts
  const simplifiedDebts = simplifyDebts(balances)

  // Calculate summary
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return {
    balances,
    simplifiedDebts,
    totalExpenses,
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Recalculate balances in real-time when expense is added
 * This is optimized for performance
 */
export function recalculateBalancesRealTime(
  currentBalances: UserBalance[],
  newExpense: ExpenseInput,
  userNames?: Map<string, { name: string; email?: string }>
): ExpenseCalculationResult {
  // Validate expense
  const validation = validateExpenseInput(newExpense)

  if (!validation.isValid) {
    return {
      balances: currentBalances,
      simplifiedDebts: [],
      totalExpenses: 0,
      isValid: false,
      errors: validation.errors,
    }
  }

  // Normalize participants
  const normalizedParticipants = normalizeExpenseShares(
    newExpense.amount,
    newExpense.participants
  )

  // Create expense object
  const expense: Expense = {
    payerId: newExpense.payerId,
    amount: newExpense.amount,
    description: newExpense.description,
    date: newExpense.date || new Date().toISOString().split('T')[0],
    participants: normalizedParticipants,
  }

  // Recalculate balances (optimized)
  const updatedBalances = recalculateBalances(
    currentBalances,
    expense,
    userNames
  )

  // Simplify debts
  const simplifiedDebts = simplifyDebts(updatedBalances)

  return {
    balances: updatedBalances,
    simplifiedDebts,
    totalExpenses: 0, // Would need to track separately
    isValid: true,
    errors: [],
  }
}

/**
 * Remove an expense and recalculate
 */
export function removeExpense(
  expenses: Expense[],
  expenseId: string,
  userNames?: Map<string, { name: string; email?: string }>
): ExpenseCalculationResult {
  const updatedExpenses = expenses.filter((exp) => exp.id !== expenseId)
  return calculateExpenseResult(updatedExpenses, userNames)
}

/**
 * Update an expense and recalculate
 */
export function updateExpense(
  expenses: Expense[],
  expenseId: string,
  updates: Partial<ExpenseInput>,
  userNames?: Map<string, { name: string; email?: string }>
): {
  isValid: boolean
  errors: string[]
  updatedExpenses: Expense[]
  calculationResult?: ExpenseCalculationResult
} {
  const expenseIndex = expenses.findIndex((exp) => exp.id === expenseId)

  if (expenseIndex === -1) {
    return {
      isValid: false,
      errors: ['Expense not found'],
      updatedExpenses: expenses,
    }
  }

  const existingExpense = expenses[expenseIndex]
  const updatedExpenseInput: ExpenseInput = {
    payerId: updates.payerId ?? existingExpense.payerId,
    amount: updates.amount ?? existingExpense.amount,
    description: updates.description ?? existingExpense.description,
    participants: updates.participants ?? existingExpense.participants,
    date: updates.date ?? existingExpense.date,
  }

  // Validate
  const validation = validateExpenseInput(updatedExpenseInput)

  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors,
      updatedExpenses: expenses,
    }
  }

  // Normalize participants
  const normalizedParticipants = normalizeExpenseShares(
    updatedExpenseInput.amount,
    updatedExpenseInput.participants
  )

  // Update expense
  const updatedExpenses = [...expenses]
  updatedExpenses[expenseIndex] = {
    ...existingExpense,
    payerId: updatedExpenseInput.payerId,
    amount: updatedExpenseInput.amount,
    description: updatedExpenseInput.description,
    date: updatedExpenseInput.date || existingExpense.date,
    participants: normalizedParticipants,
  }

  // Calculate result
  const calculationResult = calculateExpenseResult(updatedExpenses, userNames)

  return {
    isValid: true,
    errors: [],
    updatedExpenses,
    calculationResult,
  }
}








