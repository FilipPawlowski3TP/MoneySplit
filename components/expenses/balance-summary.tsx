'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, TrendingDown, ArrowRight, DollarSign } from 'lucide-react'
import { UserBalance, SimplifiedDebt } from '@/lib/expense-calculation'

interface BalanceSummaryProps {
  balances: UserBalance[]
  simplifiedDebts: SimplifiedDebt[]
}

export default function BalanceSummary({
  balances,
  simplifiedDebts,
}: BalanceSummaryProps) {
  const totalExpenses = balances.reduce(
    (sum, b) => sum + b.totalPaid,
    0
  )

  const debtors = balances.filter((b) => b.netBalance > 0.01)
  const creditors = balances.filter((b) => b.netBalance < -0.01)
  const settled = balances.filter(
    (b) => Math.abs(b.netBalance) <= 0.01
  )

  return (
    <div className="space-y-6">
      <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <DollarSign className="h-5 w-5 text-[#00E0FF]" />
            <span>Podsumowanie</span>
          </CardTitle>
          <CardDescription className="text-gray-400">Całkowite wydatki w tej grupie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00E0FF] bg-clip-text text-transparent">{totalExpenses.toFixed(2)} zł</div>
          <p className="text-sm text-gray-400 mt-2">
            {balances.length} {balances.length === 1 ? 'członek' : balances.length < 5 ? 'członków' : 'członków'}
          </p>
        </CardContent>
      </Card>

      {simplifiedDebts.length > 0 ? (
        <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <ArrowRight className="h-5 w-5 text-[#00E0FF]" />
              <span>Kto Komu Jest Winien</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Uproszczone rozliczenie długów
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {simplifiedDebts.map((debt, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">
                        {debt.fromName || debt.from}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-white">
                        {debt.toName || debt.to}
                      </span>
                    </div>
                    <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                      {debt.amount.toFixed(2)} zł
                    </Badge>
                  </div>
                  {index < simplifiedDebts.length - 1 && <Separator className="bg-white/10" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white">Wszystko Rozliczone</CardTitle>
            <CardDescription className="text-gray-400">Brak zaległych długów</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Wszystkie wydatki są zbilansowane. Nikt nikomu nie jest winien pieniędzy.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white">Indywidualne Salda</CardTitle>
          <CardDescription className="text-gray-400">Bieżące saldo dla każdego członka</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {balances.map((balance, index) => (
              <div key={balance.userId}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {balance.netBalance > 0.01 ? (
                      <TrendingUp className="h-4 w-4 text-red-400" />
                    ) : balance.netBalance < -0.01 ? (
                      <TrendingDown className="h-4 w-4 text-green-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-green-400" />
                    )}
                    <span className="font-medium text-white">
                      {balance.userName || balance.userId}
                    </span>
                  </div>
                  <Badge
                    variant={
                      balance.netBalance > 0.01
                        ? 'destructive'
                        : balance.netBalance < -0.01
                        ? 'default'
                        : 'secondary'
                    }
                    className={
                      balance.netBalance > 0.01
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : balance.netBalance < -0.01
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }
                  >
                    {balance.netBalance > 0.01
                      ? `Winien ${balance.netBalance.toFixed(2)} zł`
                      : balance.netBalance < -0.01
                      ? `Należne ${Math.abs(balance.netBalance).toFixed(2)} zł`
                      : 'Rozliczone'}
                  </Badge>
                </div>
                {index < balances.length - 1 && <Separator className="mt-3 bg-white/10" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


