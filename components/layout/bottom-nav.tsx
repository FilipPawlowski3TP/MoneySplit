'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Users, User, Settings, Plus, Receipt, UserPlus, X } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isFABOpen, setIsFABOpen] = useState(false)

  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Dashboard',
      active: pathname === '/dashboard',
    },
    {
      href: '/dashboard/groups',
      icon: Users,
      label: 'Grupy',
      active: pathname?.includes('/groups') && !pathname?.includes('/groups/['),
    },
    {
      href: '/dashboard/profile',
      icon: User,
      label: 'Profil',
      active: pathname?.includes('/profile'),
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      label: 'Ustawienia',
      active: pathname?.includes('/settings'),
    },
  ]

  const fabMenuItems = [
    {
      icon: Receipt,
      label: 'Dodaj rachunek',
      href: '/dashboard/groups',
      action: () => {
        router.push('/dashboard/groups')
        setIsFABOpen(false)
      },
    },
    {
      icon: Users,
      label: 'Utwórz grupę',
      href: '/dashboard/create-group',
      action: () => {
        router.push('/dashboard/create-group')
        setIsFABOpen(false)
      },
    },
    {
      icon: UserPlus,
      label: 'Dołącz do grupy',
      href: '/dashboard/join-group',
      action: () => {
        router.push('/dashboard/join-group')
        setIsFABOpen(false)
      },
    },
  ]

  return (
    <>
      {/* Backdrop for FAB menu */}
      <AnimatePresence>
        {isFABOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFABOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="fixed bottom-0 left-0 right-0 z-50 w-full bg-black/30 backdrop-blur-md border-t border-white/10 px-4 py-3"
      >
        <div className="container mx-auto max-w-7xl flex items-center justify-between relative">
          {/* Left side nav items */}
          <div className="flex items-center gap-6 flex-1 justify-start">
            {navItems.slice(0, 2).map((item, index) => {
              const Icon = item.icon
              const isActive = item.active

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 max-w-[80px]"
                >
                  <Link href={item.href} className="flex flex-col items-center space-y-1 relative">
                    <div className="relative">
                      <Icon
                        className={`h-6 w-6 transition-all duration-300 ${
                          isActive
                            ? 'text-[#00E0FF] drop-shadow-[0_0_10px_rgba(0,224,255,0.5)]'
                            : 'text-gray-400'
                        }`}
                      />
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-[#00E0FF]/20 blur-xl"
                          layoutId="activeGlowLeft"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs transition-all duration-300 text-center ${
                        isActive ? 'text-[#00E0FF] font-semibold' : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavIndicatorLeft"
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00E0FF]"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* FAB Button - Center */}
          <div className="relative flex justify-center items-center mx-4">
            {/* FAB Menu Items */}
            <AnimatePresence>
              {isFABOpen && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-3 mb-4">
                  {fabMenuItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        transition={{ delay: index * 0.1, duration: 0.2 }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.1, x: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={item.action}
                          className="glass-card border-white/20 hover:border-[#00E0FF]/50 flex items-center gap-3 px-4 py-3 rounded-full shadow-lg group"
                        >
                          <Icon className="h-5 w-5 text-[#00E0FF] group-hover:scale-110 transition-transform" />
                          <span className="text-white font-medium pr-2 whitespace-nowrap">{item.label}</span>
                        </motion.button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </AnimatePresence>

            {/* FAB Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: isFABOpen ? 45 : 0 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsFABOpen(!isFABOpen)}
              className="premium-button rounded-full h-14 w-14 p-0 relative shadow-2xl z-10"
            >
              <AnimatePresence mode="wait">
                {isFABOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6 text-white mx-auto" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="plus"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="h-6 w-6 text-white mx-auto" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pulsing glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full premium-button"
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
            </motion.button>
          </div>

          {/* Right side nav items */}
          <div className="flex items-center gap-6 flex-1 justify-end">
            {navItems.slice(2).map((item, index) => {
              const Icon = item.icon
              const isActive = item.active

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + (index + 2) * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 max-w-[80px]"
                >
                  <Link href={item.href} className="flex flex-col items-center space-y-1 relative">
                    <div className="relative">
                      <Icon
                        className={`h-6 w-6 transition-all duration-300 ${
                          isActive
                            ? 'text-[#00E0FF] drop-shadow-[0_0_10px_rgba(0,224,255,0.5)]'
                            : 'text-gray-400'
                        }`}
                      />
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-[#00E0FF]/20 blur-xl"
                          layoutId="activeGlowRight"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs transition-all duration-300 text-center ${
                        isActive ? 'text-[#00E0FF] font-semibold' : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavIndicatorRight"
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00E0FF]"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.nav>
    </>
  )
}

