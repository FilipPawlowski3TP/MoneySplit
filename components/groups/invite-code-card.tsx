'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Share2, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface InviteCodeCardProps {
  inviteCode: string
  groupId: string
}

export default function InviteCodeCard({ inviteCode, groupId }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const inviteLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/dashboard/join-group?code=${inviteCode}`
    : ''

  const copyCode = async () => {
    if (inviteCode) {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  if (!inviteCode) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Share2 className="h-5 w-5" />
          <span>Zaproś Przyjaciół</span>
        </CardTitle>
        <CardDescription>
          Udostępnij ten kod lub link, aby zaprosić innych do dołączenia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Kod Zaproszenia</label>
          <div className="flex items-center space-x-2">
            <Input
              value={inviteCode}
              readOnly
              className="font-mono text-lg tracking-wider text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyCode}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Link Zaproszenia</label>
          <div className="flex items-center space-x-2">
            <Input
              value={inviteLink}
              readOnly
              className="text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyLink}
              className="shrink-0"
            >
              {copiedLink ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Badge variant="secondary" className="w-full justify-center py-2">
            Udostępnij ten kod lub link znajomym, aby ich zaprosić
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}


