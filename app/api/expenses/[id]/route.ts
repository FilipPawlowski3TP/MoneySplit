import { NextRequest, NextResponse } from 'next/server'
import { deleteExpense } from '@/lib/db/expenses'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteExpense(params.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete expense or you do not have permission' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}








