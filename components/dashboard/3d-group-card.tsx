'use client'

import { useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Group } from '@/lib/supabase/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, DollarSign, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

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

interface Group3DCardProps {
  group: Group
  currentUserId: string
  index: number
}

export default function Group3DCard({ group, currentUserId, index }: Group3DCardProps) {
  const [balance, setBalance] = useState<GroupBalance | null>(null)
  const [loading, setLoading] = useState(true)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 200 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-5, 5])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    x.set(mouseX / rect.width)
    y.set(mouseY / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

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

  const userBalance = balance?.balances.find((b) => b.userId === currentUserId)
  const userNetBalance = userBalance?.netBalance || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ perspective: 1000 }}
    >
      <Link href={`/dashboard/groups/${group.id}`}>
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          whileHover={{ scale: 1.05, z: 50 }}
          className="h-full"
        >
          <Card className="glass-card h-full cursor-pointer overflow-hidden group hover:border-[#6C63FF]/50 transition-all duration-300 relative">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/10 via-transparent to-[#00E0FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#6C63FF] transition-colors">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>Utworzona {new Date(group.created_at).toLocaleDateString('pl-PL')}</span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-[#6C63FF] group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>

            <CardContent className="relative z-10">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
                </div>
              ) : userBalance ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Twoje Saldo</span>
                    <Badge
                      variant={
                        userNetBalance > 0.01
                          ? 'destructive'
                          : userNetBalance < -0.01
                          ? 'default'
                          : 'secondary'
                      }
                      className={`${
                        userNetBalance > 0.01
                          ? 'bg-red-500/20 text-red-400 border-red-500/50'
                          : userNetBalance < -0.01
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                      } flex items-center gap-1.5`}
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
                </div>
              ) : (
                <p className="text-sm text-gray-400">Kliknij, aby zobaczyć szczegóły</p>
              )}
            </CardContent>

            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  )
}

