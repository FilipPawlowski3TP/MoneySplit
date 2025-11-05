'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Users, DollarSign, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import AddExpenseDialog from '@/components/expenses/add-expense-dialog'
import ExpenseListRealtime from '@/components/expenses/expense-list-realtime'
import BalanceSummaryRealtime from '@/components/expenses/balance-summary-realtime'
import InviteCodeCard from '@/components/groups/invite-code-card'
import DeleteGroupButton from '@/components/groups/delete-group-button'
import BottomNav from '@/components/layout/bottom-nav'
import { ExpenseWithSplits } from '@/lib/supabase/types'
import { GroupWithMembers } from '@/lib/supabase/types'
import { ExpenseCalculationResult } from '@/lib/db/expense-calculation'

interface GroupDetailsContentProps {
  group: GroupWithMembers
  expenses: ExpenseWithSplits[]
  calculationResult: ExpenseCalculationResult
  currentUserId: string
  isCreator: boolean
}

export default function GroupDetailsContent({
  group,
  expenses,
  calculationResult,
  currentUserId,
  isCreator,
}: GroupDetailsContentProps) {
  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className="mb-4 flex items-center space-x-2 glass-card hover:bg-white/10 text-white border-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Powrót do Panelu</span>
            </Button>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-[#00E0FF]" />
                {group.name}
              </h1>
              <p className="text-gray-400 flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {group.members.length} {group.members.length === 1 ? 'członek' : group.members.length < 5 ? 'członków' : 'członków'}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{expenses.length} {expenses.length === 1 ? 'wydatek' : expenses.length < 5 ? 'wydatki' : 'wydatków'}</span>
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isCreator && (
                <DeleteGroupButton groupId={group.id} groupName={group.name} />
              )}
              <AddExpenseDialog groupId={group.id} members={group.members} />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Expenses List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="glass-card glass-card-hover border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#00E0FF]" />
                  Wydatki
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Wszystkie wydatki w tej grupie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseListRealtime 
                  groupId={group.id} 
                  initialExpenses={expenses}
                  currentUserId={currentUserId}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <InviteCodeCard 
              inviteCode={(group as any).invite_code || ''}
              groupId={group.id}
            />
            <BalanceSummaryRealtime
              groupId={group.id}
              initialCalculation={calculationResult}
            />
          </motion.div>
        </div>
      </div>
      <BottomNav />
      <div className="pb-24 md:pb-28" />
    </div>
  )
}

