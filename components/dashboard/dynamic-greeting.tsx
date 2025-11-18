'use client'

import { Profile } from '@/lib/supabase/types'
import { useEffect, useState } from 'react'

interface DynamicGreetingProps {
  userProfile?: Profile | null
}

export default function DynamicGreeting({ userProfile }: DynamicGreetingProps) {
  const [greeting, setGreeting] = useState({ text: 'Witaj!', emoji: '👋' })

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      
      // Get user name from profile
      let userName: string | null = null
      
      if (userProfile && userProfile.name) {
        userName = String(userProfile.name).trim()
      }
      
      // Fallback: try any property access
      if (!userName && userProfile) {
        const profileAny = userProfile as any
        if (profileAny.name) {
          userName = String(profileAny.name).trim()
        }
      }
      
      if (!userName || userName === '' || userName === 'null' || userName === 'undefined') {
        setGreeting({ text: 'Witaj!', emoji: '👋' })
        return
      }
      
      if (hour >= 5 && hour < 12) {
        setGreeting({ text: `Dzień dobry, ${userName}!`, emoji: '☀️' })
      } else if (hour >= 12 && hour < 18) {
        setGreeting({ text: `Dzień dobry, ${userName}!`, emoji: '☀️' })
      } else if (hour >= 18 && hour < 22) {
        setGreeting({ text: `Dobry wieczór, ${userName}!`, emoji: '🌙' })
      } else {
        setGreeting({ text: `Dobry wieczór, ${userName}!`, emoji: '🌙' })
      }
    }

    updateGreeting()
    // Update every minute to check if hour changed
    const interval = setInterval(updateGreeting, 60000)
    return () => clearInterval(interval)
  }, [userProfile])

  return (
    <span className="gradient-text">
      {greeting.text} {greeting.emoji}
    </span>
  )
}

