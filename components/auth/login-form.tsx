'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

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

      // Use client-side login - createBrowserClient handles cookies automatically
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        // Handle specific error types
        if (loginError.message.includes('Email not confirmed')) {
          setError(
            'Sprawdź pocztę i kliknij link potwierdzający przed zalogowaniem.'
          )
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

      console.log('Login successful, session:', data.session.user.email)

      // Wait a bit for cookies to be set by createBrowserClient
      await new Promise(resolve => setTimeout(resolve, 500))

      // Force a full page reload to ensure middleware sees cookies
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Logowanie</CardTitle>
        <CardDescription>Wprowadź swoje dane, aby uzyskać dostęp do konta</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
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
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Nie masz konta?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Zarejestruj się
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}


