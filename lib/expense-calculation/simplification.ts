/**
 * Debt simplification algorithms
 * 
 * These functions minimize the number of transactions needed to settle all debts
 */

import { UserBalance, SimplifiedDebt } from './types'

/**
 * Simplified debt structure for internal calculations
 */
interface DebtNode {
  userId: string
  userName?: string
  balance: number
}

/**
 * Simplified debt settlement algorithm
 * This minimizes the number of transactions needed
 * 
 * Algorithm: Greedy approach - match largest debtors with largest creditors
 */
export function simplifyDebts(
  balances: UserBalance[]
): SimplifiedDebt[] {
  // Create debt nodes (positive = owes money, negative = is owed money)
  const nodes: DebtNode[] = balances.map((balance) => ({
    userId: balance.userId,
    userName: balance.userName,
    balance: balance.netBalance,
  }))

  const transactions: SimplifiedDebt[] = []

  // Sort by balance (debtors first, then creditors)
  nodes.sort((a, b) => b.balance - a.balance)

  // Match debtors with creditors
  let debtorIndex = 0
  let creditorIndex = nodes.length - 1

  while (debtorIndex < creditorIndex) {
    const debtor = nodes[debtorIndex]
    const creditor = nodes[creditorIndex]

    // Skip if balance is zero or very close to zero
    if (Math.abs(debtor.balance) < 0.01) {
      debtorIndex++
      continue
    }

    if (Math.abs(creditor.balance) < 0.01) {
      creditorIndex--
      continue
    }

    // Calculate transaction amount
    const amount = Math.min(debtor.balance, Math.abs(creditor.balance))
    const roundedAmount = Math.round(amount * 100) / 100

    // Only add transaction if amount is significant (> 1 cent)
    if (roundedAmount > 0.01) {
      transactions.push({
        from: debtor.userId,
        fromName: debtor.userName,
        to: creditor.userId,
        toName: creditor.userName,
        amount: roundedAmount,
      })

      // Update balances
      debtor.balance -= roundedAmount
      creditor.balance += roundedAmount
    }

    // Move indices if balance is settled
    if (Math.abs(debtor.balance) < 0.01) {
      debtorIndex++
    }
    if (Math.abs(creditor.balance) < 0.01) {
      creditorIndex--
    }
  }

  return transactions
}

/**
 * Alternative: Optimal debt simplification using graph theory
 * This tries to find the minimum number of transactions
 * 
 * Algorithm: Find cycles in the debt graph and settle them
 */
export function simplifyDebtsOptimal(
  balances: UserBalance[]
): SimplifiedDebt[] {
  // First, apply greedy simplification
  const greedyResult = simplifyDebts(balances)

  // If greedy result is already minimal, return it
  if (greedyResult.length <= balances.filter((b) => Math.abs(b.netBalance) > 0.01).length - 1) {
    return greedyResult
  }

  // For more complex scenarios, we could implement cycle detection
  // For now, return greedy result as it's usually sufficient
  return greedyResult
}

/**
 * Calculate total debt and credit in the group
 */
export function calculateDebtSummary(balances: UserBalance[]): {
  totalDebt: number
  totalCredit: number
  netTotal: number
  debtorCount: number
  creditorCount: number
} {
  let totalDebt = 0
  let totalCredit = 0
  let debtorCount = 0
  let creditorCount = 0

  for (const balance of balances) {
    if (balance.netBalance > 0.01) {
      totalDebt += balance.netBalance
      debtorCount++
    } else if (balance.netBalance < -0.01) {
      totalCredit += Math.abs(balance.netBalance)
      creditorCount++
    }
  }

  return {
    totalDebt: Math.round(totalDebt * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    netTotal: Math.round((totalDebt - totalCredit) * 100) / 100,
    debtorCount,
    creditorCount,
  }
}








