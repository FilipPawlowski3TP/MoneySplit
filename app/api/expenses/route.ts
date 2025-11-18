import { NextRequest, NextResponse } from 'next/server'
import { createExpense, getGroupExpenses } from '@/lib/db/expenses'

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

    const expenses = await getGroupExpenses(groupId)
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, payerId, amount, description, date, splits } = body

    if (!groupId || !payerId || !amount || !description || !splits) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json(
        { error: 'Splits must be a non-empty array' },
        { status: 400 }
      )
    }

    const expense = await createExpense({
      groupId,
      payerId,
      amount,
      description,
      date,
      splits,
    })

    if (!expense) {
      return NextResponse.json(
        { error: 'Failed to create expense' },
        { status: 500 }
      )
    }

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}








