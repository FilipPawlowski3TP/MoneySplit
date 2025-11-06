# MoneySplit - Setup Guide

## Initial Setup Commands

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Configure Supabase

#### A. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be fully provisioned

#### B. Get Your Credentials

1. In your Supabase dashboard, navigate to **Settings** → **API**
2. Copy your **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
3. Copy your **anon/public** key (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

#### C. Configure Authentication URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback` (for production)

#### D. Enable Email Auth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates if needed

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
MoneySplit/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication routes
│   │   ├── callback/             # Auth callback handler
│   │   └── auth-code-error/      # Auth error page
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                    # React components
│   ├── auth/                     # Auth components
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   └── ui/                       # ShadCN UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── label.tsx
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Middleware utilities
│   └── utils.ts                  # Utility functions
├── middleware.ts                 # Next.js middleware for auth
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # TailwindCSS config
├── next.config.js                # Next.js config
└── README.md                     # Project documentation
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

## Next Steps

After setup, you'll want to:

1. Set up database schema (groups, expenses, balances)
2. Implement group creation
3. Add expense tracking
4. Build balance calculation logic
5. Add real-time updates with Supabase Realtime







