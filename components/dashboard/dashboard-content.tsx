'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import FinancialSummary from '@/components/dashboard/financial-summary'
import DynamicGreeting from '@/components/dashboard/dynamic-greeting'
import TimeWidget from '@/components/dashboard/time-widget'
import BottomNav from '@/components/layout/bottom-nav'
import SpendingChart from '@/components/dashboard/spending-chart'
import ActivityFeed from '@/components/dashboard/activity-feed'
import { Group } from '@/lib/supabase/types'
import { Profile } from '@/lib/supabase/types'

interface DashboardContentProps {
  groups: Group[]
  currentUserId: string
  userProfile?: Profile | null
}

export default function DashboardContent({ groups, currentUserId, userProfile }: DashboardContentProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Debug: Log profile in client component
  if (typeof window !== 'undefined') {
    console.log('[DashboardContent] userProfile:', userProfile)
    console.log('[DashboardContent] userProfile.name:', userProfile?.name)
  }

  useEffect(() => {
    // Delay dashboard appearance until splash screen is done
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2500) // Wait for splash screen to complete

    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.8, 
        ease: [0.4, 0, 0.2, 1],
        delay: 0.2
      }}
      className="min-h-screen relative"
    >
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                <DynamicGreeting userProfile={userProfile} />
              </h1>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg">
                Zarządzaj grupami wydatków i śledź swoje finanse
              </p>
            </div>
            {/* Time Widget moved to header */}
            <div className="hidden sm:block">
              <TimeWidget />
            </div>
          </div>
        </motion.div>

        {/* Financial Summary */}
        {groups.length > 0 && (
          <FinancialSummary groups={groups} currentUserId={currentUserId} />
        )}

        {/* Spending Chart */}
        {groups.length > 0 && (
          <SpendingChart groups={groups} currentUserId={currentUserId} />
        )}

        {/* Activity Feed */}
        {groups.length > 0 && (
          <ActivityFeed groups={groups} />
        )}
      </div>
      <BottomNav />
      <div className="pb-24 md:pb-28" />
    </motion.div>
  )
}
