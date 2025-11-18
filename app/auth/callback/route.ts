import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const token_hash = searchParams.get('token_hash')
  const token = searchParams.get('token')
  const type = searchParams.get('type')

  const supabase = await createClient()

  // Handle OAuth/code exchange (for PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    // If error, fall through to check other methods
  }

  // Handle email confirmation with token_hash
  if (token_hash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: type as 'signup' | 'recovery' | 'email',
        token_hash,
      })
      
      if (!error) {
        // Email confirmed, redirect to dashboard
        return NextResponse.redirect(`${origin}/dashboard?email_confirmed=true`)
      }
    } catch (error) {
      console.error('Error verifying OTP with token_hash:', error)
    }
  }

  // Handle email confirmation with token (older format)
  if (token && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: type as 'signup' | 'recovery' | 'email',
        token_hash: token,
      })
      
      if (!error) {
        return NextResponse.redirect(`${origin}/dashboard?email_confirmed=true`)
      }
    } catch (error) {
      console.error('Error verifying OTP with token:', error)
    }
  }

  // If we have a code but no type, try to exchange it
  if (code && !type) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (error) {
      console.error('Error exchanging code:', error)
    }
  }

  // If all methods fail, redirect to error page with debug info
  const errorParams = new URLSearchParams()
  if (type) errorParams.set('type', type)
  if (code) errorParams.set('has_code', 'true')
  if (token) errorParams.set('has_token', 'true')
  if (token_hash) errorParams.set('has_token_hash', 'true')

  return NextResponse.redirect(
    `${origin}/auth/auth-code-error?${errorParams.toString()}`
  )
}


