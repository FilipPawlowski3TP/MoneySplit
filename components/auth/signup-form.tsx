'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

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
            name: name.trim() || email.split('@')[0], // Use email prefix if name is empty
          },
        },
      })

      if (error) throw error

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setSuccess(true)
        // Don't redirect - show success message
      } else if (data.session) {
        // User is already logged in (email confirmation disabled)
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Rejestracja</CardTitle>
        <CardDescription>Utwórz nowe konto, aby rozpocząć</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
          {success && (
            <div className="text-sm bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4 rounded-md border border-green-200 dark:border-green-800">
              <p className="font-semibold mb-2">Sprawdź pocztę!</p>
              <p>
                Wysłaliśmy e-mail potwierdzający na adres <strong>{email}</strong>.
                Kliknij link w e-mailu, aby zweryfikować konto, a następnie możesz się zalogować.
              </p>
            </div>
          )}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Imię</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jan Kowalski"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">To imię będzie widoczne dla innych członków grupy</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">Hasło musi mieć co najmniej 6 znaków</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Masz już konto?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Zaloguj się
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}


