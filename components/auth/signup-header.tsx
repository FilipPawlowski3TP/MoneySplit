'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function SignupHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center justify-center space-x-2 mb-4"
      >
        <Sparkles className="h-10 w-10 text-[#00E0FF] drop-shadow-[0_0_20px_rgba(0,224,255,0.5)]" />
        <h1 className="text-5xl font-bold gradient-text">
          MoneySplit
        </h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-gray-300 text-lg"
      >
        Utwórz konto, aby zacząć dzielić wydatki
      </motion.p>
    </motion.div>
  )
}

