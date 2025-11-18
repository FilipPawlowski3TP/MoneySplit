import { createClient } from '@/lib/supabase/server'
import { getGroupExpenses } from './expenses'

export interface Balance {
  userId: string
  userName: string
  userEmail: string
  totalOwed: number
  totalPaid: number
  netBalance: number // Positive = owes money, Negative = is owed money
}

/**
 * Calculate balances for a group
 */
export async function calculateGroupBalances(
  groupId: string
): Promise<Balance[]> {
  const expenses = await getGroupExpenses(groupId)

  // Map to track balances per user
  const balancesMap = new Map<string, Balance>()

  // Process each expense
  for (const expense of expenses) {
    // Add to payer's total paid
    if (!balancesMap.has(expense.payer_id)) {
      balancesMap.set(expense.payer_id, {
        userId: expense.payer_id,
        userName: expense.payer?.name || 'Unknown',
        userEmail: expense.payer?.email || '',
        totalOwed: 0,
        totalPaid: 0,
        netBalance: 0,
      })
    }

    const payerBalance = balancesMap.get(expense.payer_id)!
    payerBalance.totalPaid += expense.amount

    // Add to each split user's total owed
    for (const split of expense.splits) {
      if (!balancesMap.has(split.user_id)) {
        balancesMap.set(split.user_id, {
          userId: split.user_id,
          userName: split.user?.name || 'Unknown',
          userEmail: split.user?.email || '',
          totalOwed: 0,
          totalPaid: 0,
          netBalance: 0,
        })
      }

      const userBalance = balancesMap.get(split.user_id)!
      userBalance.totalOwed += split.share_amount
    }
  }

  // Calculate net balance for each user
  const balances = Array.from(balancesMap.values()).map((balance) => ({
    ...balance,
    netBalance: balance.totalOwed - balance.totalPaid,
  }))

  return balances
}

/**
 * Get simplified balance summary (who owes whom)
 */
export interface SimplifiedBalance {
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserName: string
  amount: number
}

export async function getSimplifiedBalances(
  groupId: string
): Promise<SimplifiedBalance[]> {
  const balances = await calculateGroupBalances(groupId)

  // Separate users who owe money vs are owed money
  const debtors = balances.filter((b) => b.netBalance > 0)
  const creditors = balances.filter((b) => b.netBalance < 0)

  const simplified: SimplifiedBalance[] = []

  for (const debtor of debtors) {
    let remainingDebt = debtor.netBalance

    for (const creditor of creditors) {
      if (remainingDebt <= 0) break

      const creditorCredit = Math.abs(creditor.netBalance)
      const payment = Math.min(remainingDebt, creditorCredit)

      if (payment > 0.01) {
        // Only add if payment is significant (> 1 cent)
        simplified.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: Math.round(payment * 100) / 100, // Round to 2 decimals
        })

        remainingDebt -= payment
        creditor.netBalance += payment // Reduce creditor's credit
      }
    }
  }

  return simplified
}








