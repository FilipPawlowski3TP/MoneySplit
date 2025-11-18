/**
 * Balance calculation logic
 */

import { Expense, UserBalance } from './types'

/**
 * Calculate balances for a list of expenses
 * This is the core calculation function that determines who owes whom
 */
export function calculateBalances(
  expenses: Expense[],
  userNames?: Map<string, { name: string; email?: string }>
): UserBalance[] {
  const balancesMap = new Map<string, UserBalance>()

  // Process each expense
  for (const expense of expenses) {
    // Initialize or update payer balance
    if (!balancesMap.has(expense.payerId)) {
      const userInfo = userNames?.get(expense.payerId)
      balancesMap.set(expense.payerId, {
        userId: expense.payerId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
        totalPaid: 0,
        totalOwed: 0,
        netBalance: 0,
      })
    }

    const payerBalance = balancesMap.get(expense.payerId)!
    payerBalance.totalPaid += expense.amount

    // Process each participant
    for (const participant of expense.participants) {
      // Initialize or update participant balance
      if (!balancesMap.has(participant.userId)) {
        const userInfo = userNames?.get(participant.userId)
        balancesMap.set(participant.userId, {
          userId: participant.userId,
          userName: userInfo?.name,
          userEmail: userInfo?.email,
          totalPaid: 0,
          totalOwed: 0,
          netBalance: 0,
        })
      }

      const participantBalance = balancesMap.get(participant.userId)!
      participantBalance.totalOwed += participant.shareAmount
    }
  }

  // Calculate net balance for each user
  const balances = Array.from(balancesMap.values()).map((balance) => ({
    ...balance,
    netBalance: Math.round((balance.totalOwed - balance.totalPaid) * 100) / 100,
  }))

  return balances
}

/**
 * Recalculate balances when an expense is added
 * This is optimized for real-time updates
 */
export function recalculateBalances(
  currentBalances: UserBalance[],
  newExpense: Expense,
  userNames?: Map<string, { name: string; email?: string }>
): UserBalance[] {
  // Create a map of current balances for quick lookup
  const balancesMap = new Map<string, UserBalance>()
  currentBalances.forEach((balance) => {
    balancesMap.set(balance.userId, { ...balance })
  })

  // Update payer balance
  if (!balancesMap.has(newExpense.payerId)) {
    const userInfo = userNames?.get(newExpense.payerId)
    balancesMap.set(newExpense.payerId, {
      userId: newExpense.payerId,
      userName: userInfo?.name,
      userEmail: userInfo?.email,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0,
    })
  }

  const payerBalance = balancesMap.get(newExpense.payerId)!
  payerBalance.totalPaid += newExpense.amount

  // Update participant balances
  for (const participant of newExpense.participants) {
    if (!balancesMap.has(participant.userId)) {
      const userInfo = userNames?.get(participant.userId)
      balancesMap.set(participant.userId, {
        userId: participant.userId,
        userName: userInfo?.name,
        userEmail: userInfo?.email,
        totalPaid: 0,
        totalOwed: 0,
        netBalance: 0,
      })
    }

    const participantBalance = balancesMap.get(participant.userId)!
    participantBalance.totalOwed += participant.shareAmount
  }

  // Recalculate net balances
  return Array.from(balancesMap.values()).map((balance) => ({
    ...balance,
    netBalance: Math.round((balance.totalOwed - balance.totalPaid) * 100) / 100,
  }))
}

/**
 * Recalculate balances when an expense is removed
 */
export function recalculateBalancesAfterRemoval(
  currentBalances: UserBalance[],
  removedExpense: Expense
): UserBalance[] {
  const balancesMap = new Map<string, UserBalance>()
  currentBalances.forEach((balance) => {
    balancesMap.set(balance.userId, { ...balance })
  })

  // Remove from payer balance
  if (balancesMap.has(removedExpense.payerId)) {
    const payerBalance = balancesMap.get(removedExpense.payerId)!
    payerBalance.totalPaid -= removedExpense.amount
  }

  // Remove from participant balances
  for (const participant of removedExpense.participants) {
    if (balancesMap.has(participant.userId)) {
      const participantBalance = balancesMap.get(participant.userId)!
      participantBalance.totalOwed -= participant.shareAmount
    }
  }

  // Recalculate net balances
  return Array.from(balancesMap.values()).map((balance) => ({
    ...balance,
    netBalance: Math.round((balance.totalOwed - balance.totalPaid) * 100) / 100,
  }))
}








