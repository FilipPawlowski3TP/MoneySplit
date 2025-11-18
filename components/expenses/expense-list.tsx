'use client'

import { ExpenseWithSplits } from '@/lib/supabase/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, Users } from 'lucide-react'
import DeleteExpenseButton from './delete-expense-button'
import { motion } from 'framer-motion'

interface ExpenseListProps {
  expenses: ExpenseWithSplits[]
  currentUserId?: string
}

export default function ExpenseList({ expenses, currentUserId }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <motion.div 
        className="text-center py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-white">Brak wydatków</h3>
        <p className="text-gray-400">
          Dodaj pierwszy wydatek, aby rozpocząć
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense, index) => (
        <motion.div
          key={expense.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white">{expense.description}</CardTitle>
                  <CardDescription className="flex items-center space-x-4 mt-2 text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-[#00E0FF]">{expense.amount.toFixed(2)} zł</span>
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30">
                    Zapłacone przez {expense.payer?.name || 'Nieznany'}
                  </Badge>
                  <DeleteExpenseButton
                    expenseId={expense.id}
                    expenseDescription={expense.description}
                    canDelete={currentUserId === expense.payer_id}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>Podzielone między {expense.splits.length} {expense.splits.length === 1 ? 'uczestnika' : expense.splits.length < 5 ? 'uczestników' : 'uczestników'}:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expense.splits.map((split) => (
                    <Badge key={split.id} variant="outline" className="bg-white/10 border-white/20 text-white">
                      {split.user?.name || 'Nieznany'}: {split.share_amount.toFixed(2)} zł
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

