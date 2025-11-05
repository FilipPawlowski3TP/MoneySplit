'use client'

import { motion } from 'framer-motion'

export default function CreateGroupHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-bold text-white mb-2">Utwórz Nową Grupę</h1>
      <p className="text-gray-400 mt-2">
        Utwórz grupę, aby zacząć dzielić wydatki z przyjaciółmi
      </p>
    </motion.div>
  )
}

