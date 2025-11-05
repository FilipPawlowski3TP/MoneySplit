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
    <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Share2 className="h-5 w-5 text-[#00E0FF]" />
          <span>Zaproś Przyjaciół</span>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Udostępnij ten kod lub link, aby zaprosić innych do dołączenia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Kod Zaproszenia</label>
          <div className="flex items-center space-x-2">
            <Input
              value={inviteCode}
              readOnly
              className="font-mono text-lg tracking-wider text-center bg-white/10 border-white/20 text-white"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyCode}
              className="shrink-0 glass-card border-white/20 hover:bg-white/10 text-white"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Link Zaproszenia</label>
          <div className="flex items-center space-x-2">
            <Input
              value={inviteLink}
              readOnly
              className="text-sm bg-white/10 border-white/20 text-white"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyLink}
              className="shrink-0 glass-card border-white/20 hover:bg-white/10 text-white"
            >
              {copiedLink ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Badge variant="secondary" className="w-full justify-center py-2 bg-[#00E0FF]/20 text-[#00E0FF] border-[#00E0FF]/30">
            Udostępnij ten kod lub link znajomym, aby ich zaprosić
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}


