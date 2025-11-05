import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Call Supabase auth API directly to get session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const authData = await authResponse.json()

    if (!authResponse.ok || !authData.access_token) {
      return NextResponse.json(
        { error: authData.error_description || authData.error || 'Login failed' },
        { status: 400 }
      )
    }

    // Extract project ref from Supabase URL for cookie naming
    const supabaseUrlObj = new URL(supabaseUrl)
    const projectRef = supabaseUrlObj.hostname.split('.')[0]
    const cookieName = `sb-${projectRef}-auth-token`
    
    // Create the auth token cookie value
    const authTokenValue = JSON.stringify({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_at: authData.expires_at,
      expires_in: authData.expires_in,
      token_type: authData.token_type,
      user: authData.user,
    })

    // Create JSON response with user data
    const jsonResponse = NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })

    // CRITICAL: Set the cookie in the response
    jsonResponse.cookies.set(cookieName, authTokenValue, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log('[API] Set cookie:', cookieName)
    console.log('[API] User:', authData.user.email)
    console.log('[API] Final cookies in response:', jsonResponse.cookies.getAll().map(c => c.name))
    
    return jsonResponse
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    )
  }
}

