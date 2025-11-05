'use client'

import { useEffect, useState, useCallback } from 'react'
import { ExpenseCalculationResult } from '@/lib/expense-calculation'
import BalanceSummary from './balance-summary'

interface BalanceSummaryRealtimeProps {
  groupId: string
  initialCalculation: ExpenseCalculationResult
}

export default function BalanceSummaryRealtime({
  groupId,
  initialCalculation,
}: BalanceSummaryRealtimeProps) {
  const [calculation, setCalculation] = useState<ExpenseCalculationResult>(initialCalculation)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const recalculateBalances = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/expenses/balances?groupId=${groupId}`)
      if (response.ok) {
        const newCalculation = await response.json()
        setCalculation(newCalculation)
      }
    } catch (error) {
      console.error('Error recalculating balances:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [groupId])

  useEffect(() => {
    // Import supabase client dynamically to avoid SSR issues
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()

      // Subscribe to expense changes
      const channel = supabase
        .channel(`expenses-balance:${groupId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'expenses',
            filter: `group_id=eq.${groupId}`,
          },
          () => {
            // Recalculate balances when expenses change
            recalculateBalances()
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'expense_splits',
          },
          async (payload) => {
            // Check if this split belongs to an expense in this group
            const { data: expense } = await supabase
              .from('expenses')
              .select('group_id')
              .eq('id', payload.new.expense_id)
              .single()

            if (expense && expense.group_id === groupId) {
              recalculateBalances()
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    })
  }, [groupId, recalculateBalances])

  return (
    <div className={isRefreshing ? 'opacity-50 transition-opacity' : ''}>
      <BalanceSummary
        balances={calculation.balances}
        simplifiedDebts={calculation.simplifiedDebts}
      />
    </div>
  )
}

