'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import CountUp from 'react-countup'

interface AnimatedCounterProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export default function AnimatedCounter({
  value,
  decimals = 2,
  prefix = '',
  suffix = ' zł',
  duration = 2,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isInView, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {hasAnimated ? (
        <CountUp
          start={0}
          end={value}
          decimals={decimals}
          duration={duration}
          separator=" "
          prefix={prefix}
          suffix={suffix}
          decimal=","
        />
      ) : (
        `${prefix}0${suffix}`
      )}
    </span>
  )
}

