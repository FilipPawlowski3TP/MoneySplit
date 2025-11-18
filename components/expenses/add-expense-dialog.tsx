'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { GroupMember } from '@/lib/supabase/types'

interface AddExpenseDialogProps {
  groupId: string
  members: (GroupMember & { profile?: { name?: string; email?: string } })[]
}

export default function AddExpenseDialog({
  groupId,
  members,
}: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Debug: Log members (only once, not on every render)
  // Removed excessive logging

  const [formData, setFormData] = useState({
    payerId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    participants: [] as Array<{ userId: string; shareAmount: string }>,
  })

  const handleAddParticipant = () => {
    setFormData({
      ...formData,
      participants: [
        ...formData.participants,
        { userId: '', shareAmount: '' },
      ],
    })
  }

  const handleParticipantChange = (
    index: number,
    field: 'userId' | 'shareAmount',
    value: string
  ) => {
    const newParticipants = [...formData.participants]
    newParticipants[index] = {
      ...newParticipants[index],
      [field]: value,
    }
    setFormData({ ...formData, participants: newParticipants })
  }

  const handleRemoveParticipant = (index: number) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((_, i) => i !== index),
    })
  }

  const handleAddMyself = () => {
    // Only add if payer is selected and not already in participants
      if (!formData.payerId) {
        setError('Najpierw wybierz, kto zapłacił')
        return
      }

      const isAlreadyParticipant = formData.participants.some(
        (p) => p.userId === formData.payerId
      )

      if (isAlreadyParticipant) {
        setError('Jesteś już dodany jako uczestnik')
        return
      }

    // Add payer as participant with the full amount
    setFormData({
      ...formData,
      participants: [
        ...formData.participants,
        {
          userId: formData.payerId,
          shareAmount: formData.amount || '',
        },
      ],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate
      if (!formData.payerId || !formData.amount || !formData.description) {
        throw new Error('Wypełnij wszystkie wymagane pola')
      }

      if (formData.participants.length === 0) {
        throw new Error('Dodaj co najmniej jednego uczestnika')
      }

      // Validate all participants have userId and shareAmount
      const invalidParticipants = formData.participants.filter(
        (p) => !p.userId || !p.shareAmount || parseFloat(p.shareAmount) <= 0
      )
      if (invalidParticipants.length > 0) {
        throw new Error('Wybierz członka i wprowadź kwotę udziału dla wszystkich uczestników')
      }

      // Check for duplicate participants (same user selected multiple times)
      const participantUserIds = formData.participants.map((p) => p.userId)
      const uniqueUserIds = new Set(participantUserIds)
      if (participantUserIds.length !== uniqueUserIds.size) {
        throw new Error('Każdy członek może być wybrany tylko raz jako uczestnik')
      }

      // Note: It's perfectly valid for payer to also be a participant (paying for themselves)
      // So we don't check if payerId is in participants

      const totalShare = formData.participants.reduce(
        (sum, p) => sum + parseFloat(p.shareAmount || '0'),
        0
      )

      if (Math.abs(totalShare - parseFloat(formData.amount)) > 0.01) {
        throw new Error(
          `Suma kwot udziałów (${totalShare.toFixed(2)}) nie odpowiada kwocie wydatku (${formData.amount})`
        )
      }

      // Prepare expense data
      const expenseData = {
        groupId,
        payerId: formData.payerId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        splits: formData.participants.map((p) => ({
          userId: p.userId,
          shareAmount: parseFloat(p.shareAmount),
        })),
      }

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create expense')
      }

      setOpen(false)
      router.refresh()

      // Show success toast
      toast({
        title: 'Wydatek dodany',
        description: `${formData.description} został pomyślnie dodany.`,
        variant: 'success',
      })

      // Reset form
      setFormData({
        payerId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        participants: [],
      })
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Dodaj Wydatek</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj Nowy Wydatek</DialogTitle>
          <DialogDescription>
            Dodaj wydatek, aby podzielić go z członkami grupy
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-900/20 p-3 rounded-md border border-red-700"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Opis *</Label>
              <Textarea
                id="description"
                placeholder="Kolacja w restauracji"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                disabled={loading}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:ring-[#00E0FF] focus:border-[#00E0FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-300">Kwota *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:ring-[#00E0FF] focus:border-[#00E0FF]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-300">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:ring-[#00E0FF] focus:border-[#00E0FF]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payer" className="text-gray-300">Zapłacone Przez *</Label>
              <Select
                value={formData.payerId}
                onValueChange={(value) =>
                  setFormData({ ...formData, payerId: value })
                }
                disabled={loading}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-[#00E0FF] focus:border-[#00E0FF]">
                  <SelectValue placeholder="Wybierz kto zapłacił" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  {members.length > 0 ? (
                    members.map((member) => (
                      <SelectItem 
                        key={member.user_id} 
                        value={member.user_id}
                        disabled={loading}
                        className="text-white hover:bg-white/10"
                      >
                        {member.profile?.name || member.user_id || 'Nieznany'}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-members" disabled className="text-gray-400">
                      Brak dostępnych członków
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300">Uczestnicy</Label>
                <div className="flex gap-2">
                  {formData.payerId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddMyself}
                      disabled={loading}
                      className="text-xs glass-card border-white/20 hover:bg-white/10 text-white"
                    >
                      Dodaj Siebie
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddParticipant}
                    disabled={loading}
                    className="glass-card border-white/20 hover:bg-white/10 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj Uczestnika
                  </Button>
                </div>
              </div>

              {formData.participants.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Brak dodanych uczestników. Kliknij "Dodaj Uczestnika", aby dodać.
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.participants.map((participant, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-2 items-end glass-card p-4 rounded-lg border border-white/10"
                    >
                      <div className="flex-1 space-y-2">
                        <Label className="text-gray-300">Członek</Label>
                        <Select
                          value={participant.userId}
                          onValueChange={(value) =>
                            handleParticipantChange(index, 'userId', value)
                          }
                          disabled={loading}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-[#00E0FF] focus:border-[#00E0FF]">
                            <SelectValue placeholder="Wybierz członka" />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-white/10">
                            {members.length > 0 ? (
                              members.map((member) => (
                                <SelectItem
                                  key={member.user_id}
                                  value={member.user_id}
                                  disabled={loading}
                                  className="text-white hover:bg-white/10"
                                >
                                  {member.profile?.name || member.user_id || 'Nieznany'}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-members" disabled className="text-gray-400">
                                Brak dostępnych członków
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="text-gray-300">Kwota Udziału</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="50.00"
                          value={participant.shareAmount}
                          onChange={(e) =>
                            handleParticipantChange(
                              index,
                              'shareAmount',
                              e.target.value
                            )
                          }
                          disabled={loading}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:ring-[#00E0FF] focus:border-[#00E0FF]"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveParticipant(index)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        Usuń
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="glass-card border-white/20 hover:bg-white/10 text-white"
            >
              Anuluj
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="premium-button"
            >
              {loading ? 'Dodawanie...' : 'Dodaj Wydatek'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

