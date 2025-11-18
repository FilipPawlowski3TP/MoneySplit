# Expense Calculation Logic

Complete TypeScript implementation for calculating expense balances and simplifying debts.

## Features

- ✅ Add expenses with validation
- ✅ Calculate balances in real-time
- ✅ Simplify debts (minimize transactions)
- ✅ Handle rounding errors
- ✅ Full TypeScript type safety

## Quick Start

```typescript
import {
  addExpense,
  calculateExpenseResult,
  recalculateBalancesRealTime,
} from '@/lib/expense-calculation'

// Add an expense
const result = addExpense([], {
  payerId: 'user-1',
  amount: 100,
  description: 'Dinner',
  participants: [
    { userId: 'user-1', shareAmount: 50 },
    { userId: 'user-2', shareAmount: 50 },
  ],
})

// Get simplified debts
console.log(result.calculationResult?.simplifiedDebts)
// [{ from: 'user-2', to: 'user-1', amount: 50 }]
```

## Core Functions

### `addExpense(expenses, newExpense)`
Adds a new expense and returns updated calculation result.

```typescript
const result = addExpense(existingExpenses, {
  payerId: 'user-1',
  amount: 100,
  description: 'Dinner',
  participants: [
    { userId: 'user-1', shareAmount: 50 },
    { userId: 'user-2', shareAmount: 50 },
  ],
})
```

### `calculateExpenseResult(expenses)`
Calculates complete balance and debt summary from expenses list.

```typescript
const result = calculateExpenseResult(expenses)
console.log(result.balances) // User balances
console.log(result.simplifiedDebts) // Who owes whom
```

### `recalculateBalancesRealTime(currentBalances, newExpense)`
Optimized real-time recalculation when expense is added.

```typescript
const updated = recalculateBalancesRealTime(currentBalances, newExpense)
```

## Types

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
  from: string // User ID who owes
  fromName?: string
  to: string // User ID who is owed
  toName?: string
  amount: number
}
```

## Validation

All expenses are validated before calculation:
- Amount must be > 0
- At least one participant required
- Total shares must match expense amount
- No duplicate participants

## Debt Simplification

The algorithm minimizes the number of transactions needed:
- Matches largest debtors with largest creditors
- Handles rounding errors
- Returns simplified debt structure

## Examples

See `examples/expense-calculation-examples.ts` for complete examples.








