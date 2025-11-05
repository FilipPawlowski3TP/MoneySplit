# MoneySplit - Project Structure

## Overview

This document describes the complete folder structure and architecture of the MoneySplit application.

## Folder Structure

```
MoneySplit/
├── app/                              # Next.js 14 App Router
│   ├── auth/                         # Authentication routes
│   │   ├── callback/                 # OAuth callback handler
│   │   │   └── route.ts              # Handles auth code exchange
│   │   └── auth-code-error/          # Error page for auth failures
│   │       └── page.tsx
│   ├── login/                        # Login page
│   │   └── page.tsx                  # Login page component
│   ├── signup/                       # Signup page
│   │   └── page.tsx                  # Signup page component
│   ├── layout.tsx                    # Root layout (metadata, fonts)
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles + TailwindCSS
│
├── components/                       # React components
│   ├── auth/                         # Authentication components
│   │   ├── login-form.tsx            # Login form component
│   │   └── signup-form.tsx           # Signup form component
│   └── ui/                           # ShadCN UI components
│       ├── button.tsx                # Button component
│       ├── card.tsx                  # Card component
│       ├── input.tsx                 # Input component
│       └── label.tsx                 # Label component
│
├── lib/                              # Utility libraries
│   ├── supabase/                     # Supabase client configurations
│   │   ├── client.ts                 # Browser-side Supabase client
│   │   ├── server.ts                 # Server-side Supabase client
│   │   └── middleware.ts             # Middleware Supabase utilities
│   └── utils.ts                      # Utility functions (cn helper)
│
├── middleware.ts                     # Next.js middleware for auth
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # TailwindCSS configuration
├── postcss.config.js                 # PostCSS configuration
├── next.config.js                    # Next.js configuration
├── .eslintrc.json                    # ESLint configuration
├── .gitignore                        # Git ignore rules
├── README.md                         # Project documentation
├── SETUP.md                          # Setup instructions
└── PROJECT_STRUCTURE.md              # This file
```

## Architecture Overview

### Frontend (Next.js App Router)

- **Pages**: Located in `app/` directory using Next.js 14 App Router
- **Components**: Reusable React components in `components/`
- **Styling**: TailwindCSS with ShadCN UI components
- **TypeScript**: Full type safety throughout the application

### Authentication (Supabase)

- **Client-side**: `lib/supabase/client.ts` - For browser interactions
- **Server-side**: `lib/supabase/server.ts` - For server components/API routes
- **Middleware**: `lib/supabase/middleware.ts` - For route protection
- **Auth Flow**: Email/password authentication with session management

### Key Features

1. **Authentication Flow**:
   - Sign up → Email verification → Login → Session management
   - Protected routes via middleware
   - Auth callback handling for OAuth flows

2. **UI Components**:
   - ShadCN UI components for consistent design
   - TailwindCSS for styling
   - Responsive design ready

3. **Type Safety**:
   - TypeScript throughout
   - Type-safe Supabase client

## File Purposes

### Configuration Files

- `package.json`: Dependencies and npm scripts
- `tsconfig.json`: TypeScript compiler options
- `tailwind.config.ts`: TailwindCSS theme and configuration
- `next.config.js`: Next.js configuration
- `postcss.config.js`: PostCSS plugins (TailwindCSS, Autoprefixer)
- `.eslintrc.json`: ESLint rules for code quality

### Core Application Files

- `app/layout.tsx`: Root layout with metadata and global providers
- `app/page.tsx`: Home page (landing page)
- `middleware.ts`: Route protection and session refresh

### Authentication Files

- `app/login/page.tsx`: Login page
- `app/signup/page.tsx`: Signup page
- `app/auth/callback/route.ts`: OAuth callback handler
- `components/auth/login-form.tsx`: Login form component
- `components/auth/signup-form.tsx`: Signup form component

### Utility Files

- `lib/utils.ts`: Utility functions (e.g., `cn` for className merging)
- `lib/supabase/*`: Supabase client configurations for different contexts

## Environment Variables

Required environment variables (stored in `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps for Development

1. **Database Schema**: Create tables for groups, expenses, balances
2. **Group Management**: Implement group creation and member management
3. **Expense Tracking**: Add expense creation and editing
4. **Balance Calculation**: Implement balance calculation logic
5. **Real-time Updates**: Use Supabase Realtime for live updates




