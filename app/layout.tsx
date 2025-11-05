import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import SplashScreen from '@/components/ui/splash-screen'
import AnimatedBackground from '@/components/dashboard/animated-background'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MoneySplit - Split expenses with friends',
  description: 'Split expenses and track who owes whom money',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="moneysplit-theme"
        >
          <AnimatedBackground />
          <SplashScreen />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}



