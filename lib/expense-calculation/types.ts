/**
 * Core types for expense calculation logic
 */

export interface ExpenseParticipant {
  userId: string
  shareAmount: number
}

export interface ExpenseInput {
  payerId: string
  amount: number
  description: string
  participants: ExpenseParticipant[]
  date?: string
}

export interface Expense {
  id?: string
  payerId: string
  amount: number
  description: string
  date: string
  participants: ExpenseParticipant[]
}

export interface UserBalance {
  userId: string
  userName?: string
  userEmail?: string
  totalPaid: number
  totalOwed: number
  netBalance: number // Positive = owes money, Negative = is owed money
}

export interface SimplifiedDebt {
  from: string
  fromName?: string
  to: string
  toName?: string
  amount: number
}

export interface ExpenseCalculationResult {
  balances: UserBalance[]
  simplifiedDebts: SimplifiedDebt[]
  totalExpenses: number
  isValid: boolean
  errors: string[]
}








