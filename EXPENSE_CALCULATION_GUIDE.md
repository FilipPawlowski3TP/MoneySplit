# Expense Calculation Logic - Guide

## Overview

Complete TypeScript implementation for calculating expense balances and simplifying debts. This system calculates who owes whom money based on expenses in a group.

## Features

✅ **Add Expenses** - Validate and add expenses with automatic balance calculation  
✅ **Real-time Recalculation** - Optimized balance updates when expenses change  
✅ **Debt Simplification** - Minimize number of transactions needed to settle debts  
✅ **Validation** - Full validation of expense data before processing  
✅ **Type Safety** - Complete TypeScript types for all operations  

## Core Concepts

### Expense Structure
```typescript
{
  payerId: string        // Who paid
  amount: number         // Total amount
  description: string    // What it was for
  participants: [       // How it's split
    { userId: string, shareAmount: number },
    ...
  ]
}
```

### Balance Calculation
- **totalPaid**: How much the user has paid
- **totalOwed**: How much the user owes (from their shares)
- **netBalance**: `totalOwed - totalPaid`
  - **Positive** = owes money
  - **Negative** = is owed money

### Debt Simplification
The algorithm minimizes transactions by matching:
- Largest debtors with largest creditors
- Reducing to minimum number of payments needed

## Quick Start

### Basic Usage

```typescript
import {
  addExpense,
  calculateExpenseResult,
} from '@/lib/expense-calculation'

// Create expenses list
let expenses = []

// Add first expense
const result1 = addExpense(expenses, {
  payerId: 'user-1',
  amount: 100,
  description: 'Dinner',
  participants: [
    { userId: 'user-1', shareAmount: 50 },
    { userId: 'user-2', shareAmount: 50 },
  ],
})

// Get simplified debts
console.log(result1.calculationResult?.simplifiedDebts)
// [{ from: 'user-2', to: 'user-1', amount: 50 }]
```

### Calculate from Existing Expenses

```typescript
import { calculateExpenseResult } from '@/lib/expense-calculation'

const expenses = [
  {
    payerId: 'user-1',
    amount: 100,
    description: 'Dinner',
    participants: [
      { userId: 'user-1', shareAmount: 50 },
      { userId: 'user-2', shareAmount: 50 },
    ],
  },
]

const result = calculateExpenseResult(expenses)

console.log(result.balances)
// [
//   { userId: 'user-1', totalPaid: 100, totalOwed: 50, netBalance: -50 },
//   { userId: 'user-2', totalPaid: 0, totalOwed: 50, netBalance: 50 },
// ]

console.log(result.simplifiedDebts)
// [{ from: 'user-2', to: 'user-1', amount: 50 }]
```

### Real-time Recalculation

```typescript
import { recalculateBalancesRealTime } from '@/lib/expense-calculation'

const currentBalances = [
  { userId: 'user-1', totalPaid: 100, totalOwed: 50, netBalance: -50 },
  { userId: 'user-2', totalPaid: 0, totalOwed: 50, netBalance: 50 },
]

const newExpense = {
  payerId: 'user-2',
  amount: 60,
  description: 'Lunch',
  participants: [
    { userId: 'user-1', shareAmount: 30 },
    { userId: 'user-2', shareAmount: 30 },
  ],
}

const updated = recalculateBalancesRealTime(currentBalances, newExpense)

console.log(updated.balances)
// [
//   { userId: 'user-1', totalPaid: 100, totalOwed: 80, netBalance: -20 },
//   { userId: 'user-2', totalPaid: 60, totalOwed: 80, netBalance: 20 },
// ]
```

## Integration with Supabase

### Calculate Balances for Group

```typescript
import { calculateGroupBalancesWithCalculation } from '@/lib/db/expense-calculation'

const result = await calculateGroupBalancesWithCalculation(groupId)

console.log(result.balances) // User balances
console.log(result.simplifiedDebts) // Who owes whom
```

### Add Expense to Group

```typescript
import { addExpenseToGroup } from '@/lib/db/expense-calculation'

const result = await addExpenseToGroup(groupId, {
  payerId: 'user-1',
  amount: 100,
  description: 'Dinner',
  participants: [
    { userId: 'user-1', shareAmount: 50 },
    { userId: 'user-2', shareAmount: 50 },
  ],
})

if (result.isValid) {
  console.log(result.calculationResult?.simplifiedDebts)
}
```

## API Functions

### `addExpense(expenses, newExpense)`
Adds expense and returns calculation result.

**Returns:**
```typescript
{
  isValid: boolean
  errors: string[]
  updatedExpenses: Expense[]
  calculationResult?: ExpenseCalculationResult
}
```

### `calculateExpenseResult(expenses)`
Calculates complete balance and debt summary.

**Returns:**
```typescript
{
  balances: UserBalance[]
  simplifiedDebts: SimplifiedDebt[]
  totalExpenses: number
  isValid: boolean
  errors: string[]
}
```

### `recalculateBalancesRealTime(currentBalances, newExpense)`
Optimized real-time recalculation.

### `removeExpense(expenses, expenseId)`
Removes expense and recalculates.

### `updateExpense(expenses, expenseId, updates)`
Updates expense and recalculates.

## Validation

All expenses are validated:
- ✅ Amount > 0
- ✅ At least one participant
- ✅ Total shares = expense amount
- ✅ No duplicate participants
- ✅ All participants have valid user IDs

## Debt Simplification Algorithm

The simplification algorithm:
1. Sorts users by balance (debtors first, creditors last)
2. Matches largest debtors with largest creditors
3. Creates transactions to minimize total payments
4. Handles rounding errors

**Example:**
```
Before: User A owes User B $50, User B owes User C $30
After:  User A owes User C $30, User A owes User B $20
```

This reduces from 2 transactions to 2 transactions but optimizes the flow.

## Examples

See `examples/expense-calculation-examples.ts` for complete examples including:
- Adding expenses
- Calculating balances
- Real-time recalculation
- Complex group scenarios
- Removing/updating expenses

## File Structure

```
lib/expense-calculation/
├── types.ts              # Type definitions
├── validation.ts          # Validation logic
├── balance.ts             # Balance calculations
├── simplification.ts      # Debt simplification
├── expense-manager.ts     # Main manager functions
└── index.ts               # Exports
```

## Type Definitions

### `ExpenseInput`
```typescript
{
  payerId: string
  amount: number
  description: string
  participants: Array<{ userId: string; shareAmount: number }>
  date?: string
}
```

### `UserBalance`
```typescript
{
  userId: string
  userName?: string
  userEmail?: string
  totalPaid: number
  totalOwed: number
  netBalance: number // Positive = owes, Negative = is owed
}
```

### `SimplifiedDebt`
```typescript
{
  from: string      // User ID who owes
  fromName?: string
  to: string        // User ID who is owed
  toName?: string
  amount: number
}
```

## Error Handling

All functions return validation results:
```typescript
const result = addExpense(expenses, newExpense)

if (!result.isValid) {
  console.error('Errors:', result.errors)
  // Handle errors
}
```

## Performance

- **Real-time recalculation**: Optimized for frequent updates
- **Debt simplification**: O(n log n) algorithm
- **Validation**: Early exit on errors

## Next Steps

1. Use `addExpense` to add expenses
2. Display `simplifiedDebts` in UI
3. Use `recalculateBalancesRealTime` for real-time updates
4. Integrate with Supabase using `calculateGroupBalancesWithCalculation`






