'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Receipt, Users, DollarSign, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Activity {
  id: string
  type: 'expense' | 'group' | 'payment'
  message: string
  timestamp: Date
  icon: typeof Receipt
}

export default function ActivityFeed({ groups }: { groups: any[] }) {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Fetch recent activities
    const fetchActivities = async () => {
      const recentActivities: Activity[] = []
      
      // Get recent expenses from groups
      for (const group of groups.slice(0, 3)) {
        try {
          const response = await fetch(`/api/expenses?groupId=${group.id}`)
          if (response.ok) {
            const expenses = await response.json()
            const latestExpense = expenses[0]
            if (latestExpense) {
              recentActivities.push({
                id: `expense-${latestExpense.id}`,
                type: 'expense',
                message: `${latestExpense.payer?.name || 'Użytkownik'} dodał rachunek "${latestExpense.description}"`,
                timestamp: new Date(latestExpense.date || latestExpense.created_at),
                icon: Receipt,
              })
            }
          }
        } catch (error) {
          console.error('Error fetching activities:', error)
        }
      }

      // Add group creation activities
      groups.slice(0, 2).forEach((group) => {
        recentActivities.push({
          id: `group-${group.id}`,
          type: 'group',
          message: `Utworzono grupę "${group.name}"`,
          timestamp: new Date(group.created_at),
          icon: Users,
        })
      })

      // Sort by timestamp and limit to 5
      recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setActivities(recentActivities.slice(0, 5))
    }

    if (groups.length > 0) {
      fetchActivities()
    }
  }, [groups])

  if (activities.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-8"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-[#00E0FF]" />
        Ostatnie aktywności
      </h3>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#00E0FF] opacity-20">
                    <Icon className="h-5 w-5 text-[#00E0FF]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {activity.timestamp.toLocaleDateString('pl-PL', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

