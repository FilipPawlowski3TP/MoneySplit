'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import BottomNav from '@/components/layout/bottom-nav'
import {
  ChevronDown,
  ChevronUp,
  Key,
  Mail,
  LogOut,
  Bell,
  Sparkles,
  Info,
  Palette,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Profile } from '@/lib/supabase/types'

interface SettingsContentProps {
  user: any
  profile: Profile | null
}

interface CollapsibleSectionProps {
  title: string
  icon: typeof Key
  children: React.ReactNode
}

function CollapsibleSection({ title, icon: Icon, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
      <CardHeader>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="text-white flex items-center gap-2">
            <Icon className="h-5 w-5 text-[#00E0FF]" />
            {title}
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </CardHeader>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0">
              {children}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default function SettingsContent({ user, profile }: SettingsContentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' })
  const [email, setEmail] = useState(profile?.email || '')
  const [notifications, setNotifications] = useState({
    expenses: true,
    groups: true,
  })
  const [animations, setAnimations] = useState(true)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        title: 'Błąd',
        description: 'Nie udało się wylogować',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (password.new !== password.confirm) {
      toast({
        title: 'Błąd',
        description: 'Hasła nie są zgodne',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password.new,
      })

      if (error) throw error

      toast({
        title: 'Sukces',
        description: 'Hasło zostało zmienione',
      })
      setPassword({ current: '', new: '', confirm: '' })
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się zmienić hasła',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        email: email,
      })

      if (error) throw error

      toast({
        title: 'Sukces',
        description: 'Sprawdź pocztę, aby potwierdzić nowy adres e-mail',
      })
    } catch (error: any) {
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się zmienić e-maila',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
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
            Ustawienia
          </h1>
          <p className="text-gray-400">
            Zarządzaj ustawieniami konta i preferencjami
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Konto */}
          <CollapsibleSection title="Konto" icon={Key}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-gray-300">Aktualne hasło</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Wprowadź aktualne hasło"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-300">Nowe hasło</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password.new}
                  onChange={(e) => setPassword({ ...password, new: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Wprowadź nowe hasło"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-300">Potwierdź hasło</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                  placeholder="Potwierdź nowe hasło"
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={loading}
                className="premium-button w-full"
              >
                Zmień hasło
              </Button>
            </div>
            <Separator className="bg-white/10 my-4" />
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="twoj@email.com"
              />
              <Button
                onClick={handleEmailChange}
                disabled={loading}
                className="premium-button w-full mt-2"
              >
                Zmień e-mail
              </Button>
            </div>
            <Separator className="bg-white/10 my-4" />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleSignOut}
                disabled={loading}
                variant="destructive"
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Wyloguj
              </Button>
            </motion.div>
          </CollapsibleSection>

          {/* Powiadomienia */}
          <CollapsibleSection title="Powiadomienia" icon={Bell}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Powiadomienia o wydatkach</Label>
                  <p className="text-sm text-gray-400">Otrzymuj powiadomienia o nowych wydatkach</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, expenses: !notifications.expenses })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.expenses ? 'bg-[#00E0FF]' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
                    animate={{ x: notifications.expenses ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Powiadomienia o grupach</Label>
                  <p className="text-sm text-gray-400">Otrzymuj powiadomienia o nowych grupach</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, groups: !notifications.groups })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.groups ? 'bg-[#00E0FF]' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
                    animate={{ x: notifications.groups ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </CollapsibleSection>

          {/* Personalizacja */}
          <CollapsibleSection title="Personalizacja" icon={Palette}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Animacje</Label>
                  <p className="text-sm text-gray-400">Włącz/wyłącz animacje (tryb wydajności)</p>
                </div>
                <button
                  onClick={() => setAnimations(!animations)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    animations ? 'bg-[#00E0FF]' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
                    animate={{ x: animations ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </CollapsibleSection>

          {/* Informacje */}
          <CollapsibleSection title="Informacje" icon={Info}>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Wersja aplikacji</Label>
                <p className="text-sm text-gray-400 mt-1">1.0.0</p>
              </div>
              <Separator className="bg-white/10" />
              <div>
                <Label className="text-white">Polityka prywatności</Label>
                <p className="text-sm text-gray-400 mt-1">Wkrótce dostępna</p>
              </div>
              <Separator className="bg-white/10" />
              <div>
                <Label className="text-white">Kontakt</Label>
                <p className="text-sm text-gray-400 mt-1">support@moneysplit.com</p>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
      <BottomNav />
      <div className="pb-24 md:pb-28" />
    </motion.div>
  )
}

