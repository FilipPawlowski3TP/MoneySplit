'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Group3DCard from '@/components/dashboard/3d-group-card'
import BottomNav from '@/components/layout/bottom-nav'
import { Group } from '@/lib/supabase/types'

interface GroupsContentProps {
  groups: Group[]
  currentUserId: string
}

export default function GroupsContent({ groups, currentUserId }: GroupsContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen relative"
    >
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-[#00E0FF]" />
            Twoje Grupy
          </h1>
          <p className="text-gray-400">
            Zarządzaj wszystkimi swoimi grupami wydatków
          </p>
        </motion.div>

        {/* Groups Grid or Empty State */}
        {groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <Card className="glass-card max-w-lg w-full border-2 border-dashed border-white/20 hover:border-[#6C63FF]/50 transition-all duration-300">
              <CardContent className="pt-12 pb-12">
                <div className="text-center py-8">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                    className="mb-6"
                  >
                    <Users className="h-20 w-20 text-[#6C63FF] mx-auto mb-4 opacity-50" />
                  </motion.div>
                  <motion.h3
                    animate={{
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                    className="text-2xl font-bold text-white mb-3"
                  >
                    Nie masz jeszcze grup — stwórz swoją ekipę 💸
                  </motion.h3>
                  <p className="text-gray-400 mb-6 text-lg">
                    Utwórz pierwszą grupę i zacznij dzielić wydatki z przyjaciółmi!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20, rotateY: -15 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  z: 50,
                }}
                style={{ perspective: '1000px' }}
              >
                <Link href={`/dashboard/groups/${group.id}`}>
                  <Group3DCard
                    group={group}
                    currentUserId={currentUserId}
                    index={index}
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      <BottomNav />
      <div className="pb-24 md:pb-28" />
    </motion.div>
  )
}

