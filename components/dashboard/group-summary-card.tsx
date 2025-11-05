'use client'

import { Group } from '@/lib/supabase/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, DollarSign, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface GroupSummaryCardProps {
  group: Group
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

export default function GroupSummaryCard({ group, currentUserId }: GroupSummaryCardProps) {
  const [balance, setBalance] = useState<GroupBalance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`/api/expenses/balances?groupId=${group.id}`)
        if (response.ok) {
          const data = await response.json()
          setBalance(data)
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [group.id])

  // Find current user's balance
  const userBalance = balance?.balances.find((b) => b.userId === currentUserId)
  const userNetBalance = userBalance?.netBalance || 0

  // Find debts involving current user
  const userDebts = balance?.simplifiedDebts.filter(
    (d) => d.from === currentUserId || d.to === currentUserId
  ) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link href={`/dashboard/groups/${group.id}`}>
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full hover:border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {group.name}
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Utworzona {new Date(group.created_at).toLocaleDateString('pl-PL')}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : userBalance ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Twoje Saldo:</span>
                <Badge
                  variant={
                    userNetBalance > 0.01
                      ? 'destructive'
                      : userNetBalance < -0.01
                      ? 'default'
                      : 'secondary'
                  }
                  className="flex items-center space-x-1"
                >
                  {userNetBalance > 0.01 ? (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      <span>Winien {Math.abs(userNetBalance).toFixed(2)} zł</span>
                    </>
                  ) : userNetBalance < -0.01 ? (
                    <>
                      <TrendingDown className="h-3 w-3" />
                      <span>Należne {Math.abs(userNetBalance).toFixed(2)} zł</span>
                    </>
                  ) : (
                    <span>Rozliczone</span>
                  )}
                </Badge>
              </div>

              {userDebts.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground">Kto Komu Jest Winien:</p>
                  <div className="space-y-1">
                    {userDebts.slice(0, 2).map((debt, index) => {
                      const isOwing = debt.from === currentUserId
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-1">
                            {isOwing ? (
                              <>
                                <span className="text-destructive">Ty</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span>{debt.toName || 'Nieznany'}</span>
                              </>
                            ) : (
                              <>
                                <span>{debt.fromName || 'Nieznany'}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="text-green-600">Ty</span>
                              </>
                            )}
                          </div>
                          <span className="font-semibold">{debt.amount.toFixed(2)} zł</span>
                        </div>
                      )
                    })}
                    {userDebts.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{userDebts.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {userDebts.length === 0 && userNetBalance === 0 && (
                <p className="text-xs text-muted-foreground">Wszystkie wydatki są rozliczone</p>
              )}
            </div>
          ) : (
              <p className="text-sm text-muted-foreground">Kliknij, aby zobaczyć wydatki i salda</p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}


