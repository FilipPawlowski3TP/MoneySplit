/**
 * Examples of using the expense calculation logic
 */

import {
  addExpense,
  calculateExpenseResult,
  recalculateBalancesRealTime,
  removeExpense,
  updateExpense,
  type ExpenseInput,
  type Expense,
  type UserBalance,
} from '@/lib/expense-calculation'

// ============================================
// Example 1: Add an expense
// ============================================
export function exampleAddExpense() {
  const existingExpenses: Expense[] = []

  const newExpense: ExpenseInput = {
    payerId: 'user-1',
    amount: 100,
    description: 'Dinner at restaurant',
    participants: [
      { userId: 'user-1', shareAmount: 50 },
      { userId: 'user-2', shareAmount: 50 },
    ],
  }

  const result = addExpense(existingExpenses, newExpense)

  if (result.isValid && result.calculationResult) {
    console.log('Balances:', result.calculationResult.balances)
    console.log('Simplified debts:', result.calculationResult.simplifiedDebts)
    // Simplified debts: [{ from: 'user-2', to: 'user-1', amount: 50 }]
  }
}

// ============================================
// Example 2: Calculate balances from expenses
// ============================================
export function exampleCalculateBalances() {
  const expenses: Expense[] = [
    {
      id: 'exp-1',
      payerId: 'user-1',
      amount: 100,
      description: 'Dinner',
      date: '2024-01-15',
      participants: [
        { userId: 'user-1', shareAmount: 50 },
        { userId: 'user-2', shareAmount: 50 },
      ],
    },
    {
      id: 'exp-2',
      payerId: 'user-2',
      amount: 60,
      description: 'Lunch',
      date: '2024-01-16',
      participants: [
        { userId: 'user-1', shareAmount: 30 },
        { userId: 'user-2', shareAmount: 30 },
      ],
    },
  ]

  const result = calculateExpenseResult(expenses)

  console.log('Balances:', result.balances)
  // user-1: paid 100, owed 80, net = -20 (owed 20)
  // user-2: paid 60, owed 80, net = 20 (owes 20)

  console.log('Simplified debts:', result.simplifiedDebts)
  // [{ from: 'user-2', to: 'user-1', amount: 20 }]
}

// ============================================
// Example 3: Real-time balance recalculation
// ============================================
export function exampleRealTimeRecalculation() {
  // Current balances (from previous calculations)
  const currentBalances: UserBalance[] = [
    {
      userId: 'user-1',
      totalPaid: 100,
      totalOwed: 80,
      netBalance: -20,
    },
    {
      userId: 'user-2',
      totalPaid: 60,
      totalOwed: 80,
      netBalance: 20,
    },
  ]

  // New expense added
  const newExpense: ExpenseInput = {
    payerId: 'user-1',
    amount: 30,
    description: 'Coffee',
    participants: [
      { userId: 'user-1', shareAmount: 15 },
      { userId: 'user-2', shareAmount: 15 },
    ],
  }

  // Recalculate in real-time (optimized)
  const result = recalculateBalancesRealTime(
    currentBalances,
    newExpense
  )

  console.log('Updated balances:', result.balances)
  // user-1: paid 130, owed 95, net = -35
  // user-2: paid 60, owed 95, net = 35
}

// ============================================
// Example 4: Complex group with multiple expenses
// ============================================
export function exampleComplexGroup() {
  let expenses: Expense[] = []

  // Expense 1: User 1 pays 200 for dinner (split 3 ways)
  const result1 = addExpense(expenses, {
    payerId: 'user-1',
    amount: 200,
    description: 'Dinner',
    participants: [
      { userId: 'user-1', shareAmount: 66.67 },
      { userId: 'user-2', shareAmount: 66.67 },
      { userId: 'user-3', shareAmount: 66.66 },
    ],
  })

  if (result1.isValid && result1.calculationResult) {
    expenses = result1.updatedExpenses
    console.log('After expense 1:', result1.calculationResult.simplifiedDebts)
  }

  // Expense 2: User 2 pays 150 for lunch (split 2 ways)
  const result2 = addExpense(expenses, {
    payerId: 'user-2',
    amount: 150,
    description: 'Lunch',
    participants: [
      { userId: 'user-2', shareAmount: 75 },
      { userId: 'user-3', shareAmount: 75 },
    ],
  })

  if (result2.isValid && result2.calculationResult) {
    expenses = result2.updatedExpenses
    console.log('After expense 2:', result2.calculationResult.simplifiedDebts)
  }

  // Expense 3: User 3 pays 100 for groceries (split 3 ways)
  const result3 = addExpense(expenses, {
    payerId: 'user-3',
    amount: 100,
    description: 'Groceries',
    participants: [
      { userId: 'user-1', shareAmount: 33.33 },
      { userId: 'user-2', shareAmount: 33.33 },
      { userId: 'user-3', shareAmount: 33.34 },
    ],
  })

  if (result3.isValid && result3.calculationResult) {
    expenses = result3.updatedExpenses
    console.log('Final balances:', result3.calculationResult.balances)
    console.log('Final simplified debts:', result3.calculationResult.simplifiedDebts)
  }
}

// ============================================
// Example 5: Remove an expense
// ============================================
export function exampleRemoveExpense() {
  const expenses: Expense[] = [
    {
      id: 'exp-1',
      payerId: 'user-1',
      amount: 100,
      description: 'Dinner',
      date: '2024-01-15',
      participants: [
        { userId: 'user-1', shareAmount: 50 },
        { userId: 'user-2', shareAmount: 50 },
      ],
    },
    {
      id: 'exp-2',
      payerId: 'user-2',
      amount: 60,
      description: 'Lunch',
      date: '2024-01-16',
      participants: [
        { userId: 'user-1', shareAmount: 30 },
        { userId: 'user-2', shareAmount: 30 },
      ],
    },
  ]

  // Remove expense 1
  const result = removeExpense(expenses, 'exp-1')

  console.log('Balances after removal:', result.balances)
}

// ============================================
// Example 6: Update an expense
// ============================================
export function exampleUpdateExpense() {
  const expenses: Expense[] = [
    {
      id: 'exp-1',
      payerId: 'user-1',
      amount: 100,
      description: 'Dinner',
      date: '2024-01-15',
      participants: [
        { userId: 'user-1', shareAmount: 50 },
        { userId: 'user-2', shareAmount: 50 },
      ],
    },
  ]

  // Update expense amount and participants
  const result = updateExpense(
    expenses,
    'exp-1',
    {
      amount: 120,
      participants: [
        { userId: 'user-1', shareAmount: 60 },
        { userId: 'user-2', shareAmount: 60 },
      ],
    }
  )

  if (result.isValid && result.calculationResult) {
    console.log('Updated balances:', result.calculationResult.balances)
  }
}

// ============================================
// Example 7: Integration with Supabase data
// ============================================
export async function exampleWithSupabase() {
  // This would typically fetch from Supabase
  // const expenses = await getGroupExpenses(groupId)

  // Convert Supabase expenses to Expense format
  const expenses: Expense[] = [] // from Supabase

  // Calculate result
  const result = calculateExpenseResult(expenses)

  // Use in UI
  return {
    balances: result.balances,
    debts: result.simplifiedDebts,
    total: result.totalExpenses,
  }
}








