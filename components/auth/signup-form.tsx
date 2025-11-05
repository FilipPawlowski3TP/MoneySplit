'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
          data: {
            name: name.trim() || email.split('@')[0],
          },
        },
      })

      if (error) throw error

      if (data.user && !data.session) {
        setSuccess(true)
      } else if (data.session) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'Wystąpił błąd')
    } finally {
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
          <CardTitle className="text-2xl text-white">Rejestracja</CardTitle>
          <CardDescription className="text-gray-400">
            Utwórz nowe konto, aby rozpocząć
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-md"
              >
                <p className="font-semibold mb-2">Sprawdź pocztę!</p>
                <p>
                  Wysłaliśmy e-mail potwierdzający na adres <strong>{email}</strong>.
                  Kliknij link w e-mailu, aby zweryfikować konto, a następnie możesz się zalogować.
                </p>
              </motion.div>
            )}
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
              <Label htmlFor="name" className="text-gray-300">Imię</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jan Kowalski"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#6C63FF]/50"
              />
              <p className="text-xs text-gray-500">To imię będzie widoczne dla innych członków grupy</p>
            </div>
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
                minLength={6}
                className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#6C63FF]/50"
              />
              <p className="text-xs text-gray-500">Hasło musi mieć co najmniej 6 znaków</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#6C63FF] to-[#00E0FF] hover:from-[#5A52FF] hover:to-[#00C0E0] text-white border-0 neon-glow"
              disabled={loading}
            >
              {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
            </Button>
            <p className="text-sm text-gray-400 text-center">
              Masz już konto?{' '}
              <Link href="/login" className="text-[#6C63FF] hover:text-[#00E0FF] hover:underline transition-colors">
                Zaloguj się
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
