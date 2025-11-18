/**
 * Validation functions for expenses
 */

import { ExpenseInput, Expense } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate expense input before adding
 */
export function validateExpenseInput(
  expense: ExpenseInput
): ValidationResult {
  const errors: string[] = []

  // Check required fields
  if (!expense.payerId) {
    errors.push('Payer ID is required')
  }

  if (!expense.description || expense.description.trim().length === 0) {
    errors.push('Description is required')
  }

  if (!expense.amount || expense.amount <= 0) {
    errors.push('Amount must be greater than 0')
  }

  if (!expense.participants || expense.participants.length === 0) {
    errors.push('At least one participant is required')
  }

  // Validate participants
  if (expense.participants) {
    const participantIds = new Set<string>()
    let totalShare = 0

    for (let i = 0; i < expense.participants.length; i++) {
      const participant = expense.participants[i]

      if (!participant.userId) {
        errors.push(`Participant ${i + 1} is missing user ID`)
      }

      if (participantIds.has(participant.userId)) {
        errors.push(`Duplicate participant: ${participant.userId}`)
      }
      participantIds.add(participant.userId)

      if (participant.shareAmount < 0) {
        errors.push(`Participant ${i + 1} has negative share amount`)
      }

      totalShare += participant.shareAmount
    }

    // Check if total shares match expense amount (with small tolerance for rounding)
    const difference = Math.abs(totalShare - expense.amount)
    if (difference > 0.01) {
      errors.push(
        `Total share amount (${totalShare.toFixed(2)}) does not match expense amount (${expense.amount.toFixed(2)})`
      )
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate a list of expenses
 */
export function validateExpenses(expenses: Expense[]): ValidationResult {
  const errors: string[] = []

  if (expenses.length === 0) {
    errors.push('Expense list is empty')
  }

  expenses.forEach((expense, index) => {
    const result = validateExpenseInput({
      payerId: expense.payerId,
      amount: expense.amount,
      description: expense.description,
      participants: expense.participants,
      date: expense.date,
    })

    if (!result.isValid) {
      errors.push(
        ...result.errors.map((err) => `Expense ${index + 1}: ${err}`)
      )
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Normalize expense participant shares (round to 2 decimals)
 */
export function normalizeExpenseShares(
  amount: number,
  participants: { userId: string; shareAmount: number }[]
): { userId: string; shareAmount: number }[] {
  // Round each share to 2 decimals
  const normalized = participants.map((p) => ({
    ...p,
    shareAmount: Math.round(p.shareAmount * 100) / 100,
  }))

  // Calculate total to check for rounding differences
  const total = normalized.reduce((sum, p) => sum + p.shareAmount, 0)
  const difference = Math.round((amount - total) * 100) / 100

  // Adjust the first participant's share to account for rounding differences
  if (Math.abs(difference) > 0.001 && normalized.length > 0) {
    normalized[0].shareAmount = Math.round((normalized[0].shareAmount + difference) * 100) / 100
  }

  return normalized
}








