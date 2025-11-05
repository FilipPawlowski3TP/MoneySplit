import { NextRequest, NextResponse } from 'next/server'
import { getUserGroups, createGroup } from '@/lib/db/groups'

export async function GET() {
  try {
    const groups = await getUserGroups()
    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      )
    }

    const group = await createGroup(name)
    
    if (!group) {
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      )
    }

    return NextResponse.json(group)
  } catch (error: any) {
    console.error('Error creating group:', error)
    console.error('Error details:', error?.message, error?.code, error?.details)
    return NextResponse.json(
      { 
        error: 'Failed to create group',
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    )
  }
}

