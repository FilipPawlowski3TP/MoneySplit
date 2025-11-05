'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Users } from 'lucide-react'
import Link from 'next/link'
import GroupSummaryCard from '@/components/dashboard/group-summary-card'
import { Group } from '@/lib/supabase/types'

interface DashboardContentProps {
  groups: Group[]
  currentUserId: string
}

export default function DashboardContent({ groups, currentUserId }: DashboardContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Twoje Grupy</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj grupami wydatków
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/create-group">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Utwórz Grupę</span>
            </Button>
          </Link>
          <Link href="/dashboard/join-group">
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Dołącz do Grupy</span>
            </Button>
          </Link>
        </div>
      </div>

      {groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Brak grup</h3>
                <p className="text-muted-foreground mb-4">
                  Utwórz pierwszą grupę, aby zacząć dzielić wydatki
                </p>
                <Link href="/dashboard/create-group">
                  <Button>Utwórz Pierwszą Grupę</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {groups.map((group) => (
            <GroupSummaryCard
              key={group.id}
              group={group}
              currentUserId={currentUserId}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

