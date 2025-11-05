'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CreateGroupForm() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Nie udało się utworzyć grupy')
      }

      router.push(`/dashboard/groups/${data.id}`)
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Wystąpił błąd')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card border-white/20 hover:border-[#6C63FF]/50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Utwórz Grupę</CardTitle>
          <CardDescription className="text-gray-400">
            Wprowadź nazwę dla swojej grupy wydatków (np. "Wycieczka do Hiszpanii")
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-md"
              >
                {error}
              </motion.div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Nazwa Grupy</Label>
              <Input
                id="name"
                placeholder="Wycieczka do Hiszpanii"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="glass-card border-white/20 bg-white/5 text-white placeholder:text-gray-500 focus:border-[#6C63FF]/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/dashboard">
              <Button
                type="button"
                variant="outline"
                className="glass-card border-white/20 hover:border-white/40 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Anuluj</span>
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#6C63FF] to-[#00E0FF] hover:from-[#5A52FF] hover:to-[#00C0E0] text-white border-0 neon-glow"
            >
              {loading ? 'Tworzenie...' : 'Utwórz Grupę'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
