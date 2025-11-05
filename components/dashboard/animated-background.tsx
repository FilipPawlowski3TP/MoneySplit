'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Always render the base gradient, even if not mounted yet
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" suppressHydrationWarning>
      {/* Base Gradient Background with noise texture */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Noise texture overlay for depth */}
      {mounted && (
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Animated Grid with subtle movement */}
      {mounted && (
        <motion.div 
          className="absolute inset-0 opacity-[0.08]"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(108, 99, 255, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(108, 99, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      )}

      {/* Large floating gradient orbs */}
      {mounted && [...Array(4)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-[120px] opacity-20"
          style={{
            width: `${300 + i * 150}px`,
            height: `${300 + i * 150}px`,
            background: i % 2 === 0 
              ? 'radial-gradient(circle, rgba(108, 99, 255, 0.6), transparent)'
              : 'radial-gradient(circle, rgba(0, 224, 255, 0.6), transparent)',
            left: `${15 + i * 25}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.2, 0.9, 1],
            opacity: [0.15, 0.25, 0.2, 0.15],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Medium floating particles */}
      {mounted && [...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full blur-xl opacity-15"
          style={{
            width: `${80 + i * 20}px`,
            height: `${80 + i * 20}px`,
            background: i % 3 === 0
              ? 'radial-gradient(circle, rgba(108, 99, 255, 0.5), transparent)'
              : i % 3 === 1
              ? 'radial-gradient(circle, rgba(0, 224, 255, 0.5), transparent)'
              : 'radial-gradient(circle, rgba(139, 92, 246, 0.5), transparent)',
            left: `${10 + (i * 12) % 80}%`,
            top: `${15 + (i * 8) % 70}%`,
          }}
          animate={{
            x: [0, Math.random() * 40 - 20, 0],
            y: [0, Math.random() * 40 - 20, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 8 + i * 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Small pulsing dots - fixed positions */}
      {mounted && [
        { left: 10, top: 20, delay: 0 },
        { left: 30, top: 15, delay: 0.2 },
        { left: 50, top: 25, delay: 0.4 },
        { left: 70, top: 10, delay: 0.6 },
        { left: 90, top: 30, delay: 0.8 },
        { left: 15, top: 50, delay: 1.0 },
        { left: 35, top: 60, delay: 1.2 },
        { left: 55, top: 55, delay: 1.4 },
        { left: 75, top: 65, delay: 1.6 },
        { left: 85, top: 70, delay: 1.8 },
        { left: 20, top: 80, delay: 2.0 },
        { left: 40, top: 85, delay: 2.2 },
        { left: 60, top: 75, delay: 2.4 },
        { left: 80, top: 90, delay: 2.6 },
        { left: 25, top: 40, delay: 2.8 },
        { left: 45, top: 35, delay: 3.0 },
        { left: 65, top: 45, delay: 3.2 },
        { left: 95, top: 50, delay: 3.4 },
        { left: 5, top: 60, delay: 3.6 },
        { left: 95, top: 80, delay: 3.8 },
      ].map((pos, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-2 h-2 rounded-full bg-[#6C63FF] opacity-40"
          style={{
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            boxShadow: '0 0 10px rgba(108, 99, 255, 0.5)',
          }}
          animate={{
            scale: [0.5, 1.8, 0.5],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            delay: pos.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle radial gradient overlay */}
      {mounted && (
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/20 pointer-events-none" />
      )}
    </div>
  )
}


