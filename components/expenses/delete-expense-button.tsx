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
import { useToast } from '@/hooks/use-toast'

interface DeleteExpenseButtonProps {
  expenseId: string
  expenseDescription: string
  canDelete: boolean
}

export default function DeleteExpenseButton({
  expenseId,
  expenseDescription,
  canDelete,
}: DeleteExpenseButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  if (!canDelete) {
    return null
  }

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || result?.error) {
        throw new Error(result?.error || 'Failed to delete expense')
      }

      setOpen(false)
      router.refresh()

      // Show success toast
      toast({
        title: 'Wydatek usunięty',
        description: `${expenseDescription} został pomyślnie usunięty.`,
        variant: 'default',
      })
    } catch (error: any) {
      console.error('Delete expense error:', error)
      setError(error.message || 'Failed to delete expense')
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się usunąć wydatku.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno?</AlertDialogTitle>
          <AlertDialogDescription>
            Tej akcji nie można cofnąć. To na stałe usunie wydatek
            <strong> "{expenseDescription}"</strong> i wszystkie jego podziały.
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


