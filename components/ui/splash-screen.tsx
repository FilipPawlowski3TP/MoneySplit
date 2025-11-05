'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onComplete?: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [show, setShow] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        setShow(false)
        if (onComplete) {
          onComplete()
        }
      }, 800) // Wait for exit animation
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={isExiting ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          transition={{ 
            duration: 0.8, 
            ease: [0.4, 0, 0.2, 1],
            opacity: { duration: 0.6 },
            scale: { duration: 0.8 },
            filter: { duration: 0.8 }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center gradient-bg"
        >
          {/* Animated particles background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-[#00E0FF] opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 20 - 10, 0],
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Logo and text */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={isExiting ? { opacity: 0, y: -20, scale: 0.8 } : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center relative z-10"
          >
            <motion.div
              animate={isExiting ? {
                scale: [1, 0.8, 0],
                rotate: [0, 180, 360],
                opacity: [1, 0.5, 0],
              } : {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: isExiting ? 0.8 : 2,
                repeat: isExiting ? 0 : Infinity,
                ease: 'easeInOut',
              }}
              className="mb-6"
            >
              <Sparkles className="h-20 w-20 text-[#00E0FF] mx-auto drop-shadow-[0_0_20px_rgba(0,224,255,0.5)]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isExiting ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }}
              transition={{ duration: isExiting ? 0.6 : 0.8, delay: isExiting ? 0 : 0.4 }}
              className="text-6xl font-bold bg-gradient-to-r from-[#6C63FF] via-[#00E0FF] to-[#6C63FF] bg-clip-text text-transparent"
              style={{
                backgroundSize: '200% 100%',
                animation: isExiting ? 'none' : 'gradient-shift 3s ease infinite',
              }}
            >
              MoneySplit
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: isExiting ? 0.4 : 0.8, delay: isExiting ? 0 : 0.6 }}
              className="text-gray-400 mt-4 text-lg"
            >
              Dziel wydatki inteligentnie
            </motion.p>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2"
          >
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#00E0FF]"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

