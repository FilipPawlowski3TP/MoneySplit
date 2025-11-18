import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

export default async function AuthCodeError({
  searchParams,
}: {
  searchParams: { type?: string; has_code?: string; has_token?: string; has_token_hash?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is already logged in, redirect to dashboard
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Już Zalogowany</CardTitle>
            <CardDescription>Jesteś już uwierzytelniony</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Przejdź do Panelu</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Wymagane Potwierdzenie Email</span>
          </CardTitle>
          <CardDescription>
            Wystąpił problem z weryfikacją linku potwierdzającego email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Co zrobić:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Sprawdź pocztę pod kątem linku potwierdzającego od Supabase</li>
              <li>Upewnij się, że klikasz najnowszy e-mail potwierdzający</li>
              <li>Spróbuj zalogować się bezpośrednio - jeśli email jest potwierdzony, logowanie powinno działać</li>
              <li>Jeśli nadal masz problemy, sprawdź folder ze spamem</li>
            </ol>
          </div>

          <div className="pt-4 space-y-2">
            <Link href="/login">
              <Button className="w-full">Spróbuj Zalogować</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="w-full flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Powrót do Rejestracji</span>
              </Button>
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-muted rounded-md text-xs">
              <p className="font-semibold mb-2">Debug Info:</p>
              <p>Type: {searchParams.type || 'none'}</p>
              <p>Has code: {searchParams.has_code || 'no'}</p>
              <p>Has token: {searchParams.has_token || 'no'}</p>
              <p>Has token_hash: {searchParams.has_token_hash || 'no'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


