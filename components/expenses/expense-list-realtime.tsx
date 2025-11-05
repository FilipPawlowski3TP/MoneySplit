'use client'

import { useEffect, useState } from 'react'
import { ExpenseWithSplits } from '@/lib/supabase/types'
import ExpenseList from './expense-list'
import { useToast } from '@/hooks/use-toast'

interface ExpenseListRealtimeProps {
  groupId: string
  initialExpenses: ExpenseWithSplits[]
  currentUserId?: string
}

export default function ExpenseListRealtime({
  groupId,
  initialExpenses,
  currentUserId,
}: ExpenseListRealtimeProps) {
  const [expenses, setExpenses] = useState<ExpenseWithSplits[]>(initialExpenses)
  const { toast } = useToast()

  useEffect(() => {
    // Import supabase client dynamically to avoid SSR issues
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()

      // Subscribe to new expenses
      const insertChannel = supabase
        .channel(`expenses:${groupId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'expenses',
            filter: `group_id=eq.${groupId}`,
          },
          async (payload) => {
            console.log('New expense added:', payload.new)
            
            // Fetch the new expense with all related data
            const { data: splits } = await supabase
              .from('expense_splits')
              .select('*')
              .eq('expense_id', payload.new.id)

            if (splits) {
              // Get all user IDs (splits + payer)
              const userIds = new Set([
                payload.new.payer_id,
                ...splits.map((s) => s.user_id),
              ])

              const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', Array.from(userIds))

              const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

              // Format expense
              const formattedExpense: ExpenseWithSplits = {
                ...payload.new,
                splits: splits.map((split) => ({
                  ...split,
                  user: profilesMap.get(split.user_id) || {},
                })),
                payer: profilesMap.get(payload.new.payer_id) || {},
              }

              // Add to expenses list
              setExpenses((prev) => [formattedExpense, ...prev])

              // Show toast notification
              toast({
                title: 'Nowy wydatek',
                description: `${formattedExpense.payer?.name || 'Nieznany'} dodał "${formattedExpense.description}" za ${formattedExpense.amount.toFixed(2)} zł`,
                variant: 'success',
              })
            }
          }
        )
        .subscribe()

      // Subscribe to expense deletions
      const deleteChannel = supabase
        .channel(`expenses-delete:${groupId}`)
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'expenses',
            filter: `group_id=eq.${groupId}`,
          },
          (payload) => {
            console.log('Expense deleted:', payload.old.id)
            setExpenses((prev) => prev.filter((e) => e.id !== payload.old.id))
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(insertChannel)
        supabase.removeChannel(deleteChannel)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId])

  return <ExpenseList expenses={expenses} currentUserId={currentUserId} />
}

