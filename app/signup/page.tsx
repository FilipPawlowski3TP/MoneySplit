import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignupForm from '@/components/auth/signup-form'
import SignupHeader from '@/components/auth/signup-header'

export default async function SignupPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    return redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-8 relative z-10">
        <SignupHeader />
        <SignupForm />
      </div>
    </div>
  )
}
