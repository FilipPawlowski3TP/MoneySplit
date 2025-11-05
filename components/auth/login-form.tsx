'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        if (loginError.message.includes('Email not confirmed')) {
          setError('Sprawdź pocztę i kliknij link potwierdzający przed zalogowaniem.')
        } else if (loginError.message.includes('Invalid login credentials')) {
          setError('Nieprawidłowy email lub hasło. Sprawdź swoje dane.')
        } else {
          setError(loginError.message || 'Logowanie nie powiodło się. Spróbuj ponownie.')
        }
        setLoading(false)
        return
      }

      if (!data.session) {
        setError('Nie udało się utworzyć sesji. Spróbuj ponownie.')
        setLoading(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Wystąpił błąd')
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-card border-white/20 hover:border-[#6C63FF]/50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Zaloguj się</CardTitle>
          <CardDescription className="text-gray-400">
            Wprowadź swoje dane, aby uzyskać dostęp do konta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-md"
              >
                {error}
              </motion.div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#6C63FF]/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Hasło</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#6C63FF]/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#6C63FF] to-[#00E0FF] hover:from-[#5A52FF] hover:to-[#00C0E0] text-white border-0 neon-glow"
              disabled={loading}
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
            <p className="text-sm text-gray-400 text-center">
              Nie masz konta?{' '}
              <Link href="/signup" className="text-[#6C63FF] hover:text-[#00E0FF] hover:underline transition-colors">
                Zarejestruj się
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
