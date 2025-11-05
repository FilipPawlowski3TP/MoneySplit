'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Users } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { motion } from 'framer-motion'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">MoneySplit</h1>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Wyloguj</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </nav>
  )
}


