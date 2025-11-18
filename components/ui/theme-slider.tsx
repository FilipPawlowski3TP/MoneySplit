"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeSlider() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isDark, setIsDark] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return
    
    const updateTheme = () => {
      // Check actual HTML class
      const htmlHasDark = document.documentElement.classList.contains('dark')
      const currentTheme = theme || (htmlHasDark ? 'dark' : 'light')
      
      if (currentTheme === 'dark' || htmlHasDark) {
        setIsDark(true)
        if (!htmlHasDark) {
          document.documentElement.classList.add('dark')
        }
      } else {
        setIsDark(false)
        if (htmlHasDark) {
          document.documentElement.classList.remove('dark')
        }
      }
    }
    
    updateTheme()
    
    // Watch for class changes on HTML element
    const observer = new MutationObserver(() => {
      const htmlHasDark = document.documentElement.classList.contains('dark')
      setIsDark(htmlHasDark)
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    
    // Listen for storage changes (when theme changes in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'moneysplit-theme') {
        const newTheme = e.newValue || 'dark'
        if (newTheme === 'dark') {
          setIsDark(true)
          document.documentElement.classList.add('dark')
        } else {
          setIsDark(false)
          document.documentElement.classList.remove('dark')
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      observer.disconnect()
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [theme, mounted])

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark'
    console.log('[ThemeSlider] Toggling theme from', theme, 'to', newTheme)
    
    // Update state immediately
    setIsDark(!isDark)
    
    // Update HTML class immediately
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    // Set theme in next-themes (this will persist to localStorage)
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <div className="relative w-14 h-8 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00E0FF] p-1">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg" />
      </div>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className="relative w-14 h-8 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00E0FF] p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 focus:ring-offset-transparent hover:opacity-90"
      aria-label="Przełącz motyw"
      type="button"
    >
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
        animate={{
          x: isDark ? 12 : -12,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <motion.div
          animate={{
            rotate: isDark ? 0 : 180,
            scale: isDark ? 1 : 0.8,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 text-[#6C63FF]" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-[#6C63FF]" />
          )}
        </motion.div>
      </motion.div>
    </button>
  )
}

