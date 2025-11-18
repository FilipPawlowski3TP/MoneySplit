import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Test endpoint to check if auth is working
 * Call this after login to verify session
 */
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user, session },
    error,
  } = await supabase.auth.getUser()

  return NextResponse.json({
    authenticated: !!user,
    hasSession: !!session,
    userId: user?.id,
    email: user?.email,
    error: error?.message,
  })
}








