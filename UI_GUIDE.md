# MoneySplit UI Guide

## Overview

Complete modern UI implementation for MoneySplit using Next.js, TypeScript, TailwindCSS, and ShadCN UI components.

## Pages

### 1. Login Page (`/login`)
- Clean, centered design with gradient background
- ShadCN Card component for form
- Responsive layout
- Link to signup page

### 2. Signup Page (`/signup`)
- Matching design with login page
- Form validation
- Password requirements
- Link to login page

### 3. Dashboard (`/dashboard`)
- List of all user's groups
- Create new group button
- Empty state when no groups
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
- Group cards with hover effects

### 4. Create Group (`/dashboard/create-group`)
- Simple form to create new group
- Back button to dashboard
- Form validation

### 5. Group Details (`/dashboard/groups/[id]`)
- Group information header
- Add expense button
- Expense list
- Balance summary sidebar
- Responsive layout (2 columns on desktop)

## Components

### UI Components (ShadCN)
- `Button` - Various variants (default, outline, ghost, destructive)
- `Card` - Card container with header, content, footer
- `Input` - Text input fields
- `Label` - Form labels
- `Textarea` - Multi-line text input
- `Dialog` - Modal dialogs
- `Select` - Dropdown selects
- `Badge` - Status badges
- `Separator` - Visual dividers

### Layout Components
- `Navbar` - Top navigation bar with sign out
- `LoginForm` - Login form component
- `SignupForm` - Signup form component

### Feature Components
- `CreateGroupForm` - Form to create new group
- `AddExpenseDialog` - Modal dialog to add expense
- `ExpenseList` - List of expenses
- `BalanceSummary` - Summary of balances and debts

## Design Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Flexible grid layouts
- Touch-friendly buttons

### Visual Elements
- Gradient backgrounds on auth pages
- Hover effects on cards
- Icons from lucide-react
- Color-coded badges for balances
- Shadows and transitions

### User Experience
- Loading states on buttons
- Error messages in forms
- Empty states for empty lists
- Confirmation dialogs for actions
- Clear navigation paths

## Routing

```
/ → Redirects to /dashboard or /login
/login → Login page
/signup → Signup page
/dashboard → Dashboard (list of groups)
/dashboard/create-group → Create new group
/dashboard/groups/[id] → Group details
```

## Component Structure

```
components/
├── auth/
│   ├── login-form.tsx
│   └── signup-form.tsx
├── groups/
│   └── create-group-form.tsx
├── expenses/
│   ├── add-expense-dialog.tsx
│   ├── expense-list.tsx
│   └── balance-summary.tsx
├── layout/
│   └── navbar.tsx
└── ui/
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── label.tsx
    ├── textarea.tsx
    ├── dialog.tsx
    ├── select.tsx
    ├── badge.tsx
    └── separator.tsx
```

## Styling

### Colors
- Primary: Blue (from Tailwind config)
- Destructive: Red for debts/errors
- Success: Green for settled balances
- Muted: Gray for secondary text

### Typography
- Headings: Bold, various sizes
- Body: Regular weight
- Muted text: Secondary color

### Spacing
- Consistent padding and margins
- Card spacing: 6px (p-6)
- Form spacing: 4px (space-y-4)

## Features

### Dashboard
- ✅ List all groups
- ✅ Create new group
- ✅ Empty state
- ✅ Responsive grid

### Group Details
- ✅ View expenses
- ✅ Add expenses
- ✅ View balances
- ✅ See who owes whom
- ✅ Individual balances

### Add Expense
- ✅ Description
- ✅ Amount
- ✅ Date
- ✅ Payer selection
- ✅ Multiple participants
- ✅ Share amount per participant
- ✅ Validation

## Responsive Breakpoints

- **Mobile** (< 640px): Single column, stacked layout
- **Tablet** (640px - 1024px): 2 columns
- **Desktop** (> 1024px): 3 columns, sidebars

## Next Steps

1. Add expense editing
2. Add expense deletion
3. Add member management
4. Add group settings
5. Add real-time updates
6. Add notifications
7. Add dark mode toggle






