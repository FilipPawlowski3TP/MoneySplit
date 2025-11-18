'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function loginAction(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  if (!data.session) {
    return {
      error: 'No session created',
    }
  }

  // CRITICAL: Set cookies manually in server action
  // setSession() doesn't trigger setAll in server actions, so we must set cookies manually
  const cookieStore = await cookies()
  
  // Extract project ref from Supabase URL for cookie naming
  const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!)
  const projectRef = supabaseUrl.hostname.split('.')[0]
  const cookieName = `sb-${projectRef}-auth-token`
  
  // Create the auth token cookie value
  const authTokenValue = JSON.stringify({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
    token_type: data.session.token_type,
    user: data.session.user,
  })

  // Set the cookie manually
  cookieStore.set(cookieName, authTokenValue, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  console.log('[Server Action] Set cookie:', cookieName)
  console.log('[Server Action] Session user:', data.session.user.email)

  // Verify cookies are set
  const allCookies = cookieStore.getAll()
  console.log('[Server Action] Cookies after login:', allCookies.map(c => c.name))

  // Revalidate paths to ensure fresh data
  revalidatePath('/dashboard')
  revalidatePath('/')

  // Return success instead of redirect - let client handle redirect
  // This ensures cookies are sent to browser before redirect
  return {
    success: true,
    user: {
      id: data.session.user.id,
      email: data.session.user.email,
    },
  }
}

