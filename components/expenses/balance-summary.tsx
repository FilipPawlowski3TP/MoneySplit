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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Podsumowanie</span>
          </CardTitle>
          <CardDescription>Całkowite wydatki w tej grupie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalExpenses.toFixed(2)} zł</div>
          <p className="text-sm text-muted-foreground mt-2">
            {balances.length} {balances.length === 1 ? 'członek' : balances.length < 5 ? 'członków' : 'członków'}
          </p>
        </CardContent>
      </Card>

      {simplifiedDebts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5" />
              <span>Kto Komu Jest Winien</span>
            </CardTitle>
            <CardDescription>
              Uproszczone rozliczenie długów
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {simplifiedDebts.map((debt, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {debt.fromName || debt.from}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {debt.toName || debt.to}
                      </span>
                    </div>
                    <Badge variant="destructive">
                      {debt.amount.toFixed(2)} zł
                    </Badge>
                  </div>
                  {index < simplifiedDebts.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Wszystko Rozliczone</CardTitle>
            <CardDescription>Brak zaległych długów</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Wszystkie wydatki są zbilansowane. Nikt nikomu nie jest winien pieniędzy.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Indywidualne Salda</CardTitle>
          <CardDescription>Bieżące saldo dla każdego członka</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {balances.map((balance, index) => (
              <div key={balance.userId}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {balance.netBalance > 0.01 ? (
                      <TrendingUp className="h-4 w-4 text-destructive" />
                    ) : balance.netBalance < -0.01 ? (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-green-500" />
                    )}
                    <span className="font-medium">
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
                  >
                    {balance.netBalance > 0.01
                      ? `Winien ${balance.netBalance.toFixed(2)} zł`
                      : balance.netBalance < -0.01
                      ? `Należne ${Math.abs(balance.netBalance).toFixed(2)} zł`
                      : 'Rozliczone'}
                  </Badge>
                </div>
                {index < balances.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


