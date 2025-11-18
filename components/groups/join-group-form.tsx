'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface JoinGroupFormProps {
  initialCode?: string
}

export default function JoinGroupForm({ initialCode }: JoinGroupFormProps) {
  const [inviteCode, setInviteCode] = useState(initialCode?.toUpperCase() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.toUpperCase().trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join group')
      }

      router.push(`/dashboard/groups/${data.group.id}`)
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wprowadź Kod Zaproszenia</CardTitle>
        <CardDescription>
          Poproś twórcę grupy o kod zaproszenia lub link
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Kod Zaproszenia</Label>
            <Input
              id="inviteCode"
              placeholder="ABC123"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
              disabled={loading}
              maxLength={6}
              className="font-mono text-lg tracking-wider"
            />
            <p className="text-xs text-muted-foreground">
              Wprowadź 6-znakowy kod zaproszenia
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/dashboard">
            <Button type="button" variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Anuluj</span>
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Dołączanie...' : 'Dołącz do Grupy'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

