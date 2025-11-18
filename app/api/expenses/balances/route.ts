import { NextRequest, NextResponse } from 'next/server'
import { calculateGroupBalancesWithCalculation } from '@/lib/db/expense-calculation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId is required' },
        { status: 400 }
      )
    }

    const calculationResult = await calculateGroupBalancesWithCalculation(groupId)

    return NextResponse.json(calculationResult)
  } catch (error) {
    console.error('Error calculating balances:', error)
    return NextResponse.json(
      { error: 'Failed to calculate balances' },
      { status: 500 }
    )
  }
}








