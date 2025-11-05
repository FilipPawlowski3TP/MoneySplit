'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2 } from 'lucide-react'

interface DeleteGroupButtonProps {
  groupId: string
  groupName: string
}

export default function DeleteGroupButton({ groupId, groupName }: DeleteGroupButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || result?.error) {
        throw new Error(result?.error || 'Failed to delete group')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Delete group error:', error)
      setError(error.message || 'Failed to delete group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="flex items-center space-x-2">
          <Trash2 className="h-4 w-4" />
          <span>Usuń Grupę</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno?</AlertDialogTitle>
          <AlertDialogDescription>
            Tej akcji nie można cofnąć. To na stałe usunie grupę
            <strong> "{groupName}"</strong> i wszystkie jej wydatki.
          </AlertDialogDescription>
          {error && (
            <div className="mt-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={() => setError(null)}>
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Usuwanie...' : 'Usuń'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

