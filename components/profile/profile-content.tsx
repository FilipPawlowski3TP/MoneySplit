'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, DollarSign, TrendingUp, Sparkles } from 'lucide-react'
import BottomNav from '@/components/layout/bottom-nav'
import { Profile } from '@/lib/supabase/types'

interface ProfileContentProps {
  profile: Profile | null
  currentUserId: string
  stats: {
    activeGroups: number
    totalExpenses: number
    totalBalance: number
  }
}

export default function ProfileContent({ profile, currentUserId, stats }: ProfileContentProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen relative"
    >
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-[#00E0FF]" />
            Profil
          </h1>
          <p className="text-gray-400">
            Zarządzaj swoim profilem i preferencjami
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00E0FF] opacity-75 blur-md pulsing-glow"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <Avatar className="h-24 w-24 border-4 border-[#6C63FF]/50 relative z-10">
                    <AvatarImage src="" alt={profile?.name || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-[#6C63FF] to-[#00E0FF] text-white font-semibold text-2xl">
                      {getInitials(profile?.name)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {profile?.name || 'Użytkownik'}
                  </h2>
                  <p className="text-gray-400 mb-4">{profile?.email || ''}</p>
                  <Badge variant="secondary" className="bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30">
                    Aktywny użytkownik
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <Card className="glass-card glass-card-hover border-white/10 hover:border-[#6C63FF]/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-[#6C63FF]" />
                Aktywne grupy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00E0FF] bg-clip-text text-transparent">
                {stats.activeGroups}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#00E0FF]" />
                Wydatki razem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00E0FF] bg-clip-text text-transparent">
                {stats.totalExpenses.toFixed(2)} zł
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Saldo całkowite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${
                stats.totalBalance >= 0 
                  ? 'bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent'
              }`}>
                {stats.totalBalance >= 0 ? '+' : ''}{stats.totalBalance.toFixed(2)} zł
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <BottomNav />
      <div className="pb-24 md:pb-28" />
    </motion.div>
  )
}

