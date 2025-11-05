# MoneySplit

A web application for splitting expenses and tracking who owes whom money. Built with Next.js, TypeScript, TailwindCSS, ShadCN UI, and Supabase.

## Features

- User authentication (Sign up / Login)
- Create groups for shared expenses (e.g., "Trip to Spain")
- Add shared expenses to groups
- Track balances and see who owes whom money

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS + ShadCN UI
- **Backend & Auth**: Supabase (PostgreSQL + Auth + Realtime)
- **Hosting**: Vercel

## Project Structure

```
MoneySplit/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Auth callback routes
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # ShadCN UI components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   └── utils.ts          # Utility functions
├── middleware.ts         # Next.js middleware for auth
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # TailwindCSS configuration
└── next.config.js        # Next.js configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configure Supabase Auth

1. In your Supabase dashboard, go to Authentication > URL Configuration
2. Add your site URL (for local development: `http://localhost:3000`)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://your-domain.vercel.app/auth/callback` (for production)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Next Steps

- Set up database schema for groups, expenses, and balances
- Implement group creation and management
- Add expense tracking functionality
- Build balance calculation logic
- Add real-time updates using Supabase Realtime




