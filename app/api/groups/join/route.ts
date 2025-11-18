import { NextRequest, NextResponse } from 'next/server'
import { joinGroupByCode } from '@/lib/db/groups'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { inviteCode } = await request.json()

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      )
    }

    // Get user from cookie as fallback (same as middleware)
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const authCookie = allCookies.find(c => c.name.includes('auth-token'))
    
    let user = null
    
    if (authCookie) {
      try {
        const cookieValue = JSON.parse(authCookie.value)
        if (cookieValue.user && cookieValue.access_token) {
          user = cookieValue.user
        }
      } catch (e) {
        // Cookie parsing failed
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const group = await joinGroupByCode(inviteCode)

    if (!group) {
      return NextResponse.json(
        { error: 'Invalid invite code or unable to join group' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      group: {
        id: group.id,
        name: group.name,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    )
  }
}








