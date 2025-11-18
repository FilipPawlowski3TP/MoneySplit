'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react'
import { Group } from '@/lib/supabase/types'
import AnimatedCounter from '@/components/dashboard/animated-counter'

interface FinancialSummaryProps {
  groups: Group[]
  currentUserId: string
}

interface GroupBalance {
  balances: Array<{
    userId: string
    userName: string
    netBalance: number
  }>
  simplifiedDebts: Array<{
    from: string
    fromName?: string
    to: string
    toName?: string
    amount: number
  }>
}

export default function FinancialSummary({ groups, currentUserId }: FinancialSummaryProps) {
  const [summary, setSummary] = useState({
    totalSpent: 0,
    owed: 0,
    owedTo: 0,
    groupsCount: groups.length,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        let totalSpent = 0
        let owed = 0
        let owedTo = 0

        for (const group of groups) {
          try {
            const response = await fetch(`/api/expenses/balances?groupId=${group.id}`)
            if (response.ok) {
              const data: GroupBalance = await response.json()
              const userBalance = data.balances.find((b) => b.userId === currentUserId)
              
              if (userBalance) {
                // Get total expenses from group
                const expensesResponse = await fetch(`/api/expenses?groupId=${group.id}`)
                if (expensesResponse.ok) {
                  const expenses = await expensesResponse.json()
                  const groupTotal = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
                  totalSpent += groupTotal

                  if (userBalance.netBalance > 0.01) {
                    owed += userBalance.netBalance
                  } else if (userBalance.netBalance < -0.01) {
                    owedTo += Math.abs(userBalance.netBalance)
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching balance for group ${group.id}:`, error)
          }
        }

        setSummary({
          totalSpent,
          owed,
          owedTo,
          groupsCount: groups.length,
        })
      } catch (error) {
        console.error('Error fetching summary:', error)
      } finally {
        setLoading(false)
      }
    }

    if (groups.length > 0) {
      fetchSummary()
    } else {
      setLoading(false)
    }
  }, [groups, currentUserId])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card">
            <CardHeader>
              <div className="h-4 bg-white/10 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-white/10 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </motion.div>
    )
  }

  const stats = [
    {
      title: 'Wydano razem',
      value: `${summary.totalSpent.toFixed(2)} zł`,
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Długi',
      value: `${summary.owed.toFixed(2)} zł`,
      icon: TrendingUp,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      title: 'Należne Tobie',
      value: `${summary.owedTo.toFixed(2)} zł`,
      icon: TrendingDown,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'Aktywne grupy',
      value: summary.groupsCount.toString(),
      icon: Users,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
  ]

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <Card className={`glass-card ${stat.bgColor} ${stat.borderColor} border-2 hover:border-opacity-60 transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} opacity-20`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.title === 'Aktywne grupy' ? (
                    stat.value
                  ) : (
                    <AnimatedCounter
                      value={stat.title === 'Wydano razem' ? summary.totalSpent : 
                             stat.title === 'Długi' ? summary.owed : summary.owedTo}
                      decimals={2}
                      suffix=" zł"
                      duration={2}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

