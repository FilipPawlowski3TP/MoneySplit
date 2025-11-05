import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignupForm from '@/components/auth/signup-form'
import { Users } from 'lucide-react'

export default async function SignupPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">MoneySplit</h1>
          </div>
          <p className="text-muted-foreground">
            Utwórz konto, aby zacząć dzielić wydatki
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}


