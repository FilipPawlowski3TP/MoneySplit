import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getGroupById } from '@/lib/db/groups'
import { getGroupExpenses } from '@/lib/db/expenses'
import { calculateGroupBalancesWithCalculation } from '@/lib/db/expense-calculation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, ArrowLeft, Users, DollarSign, TrendingUp, Copy, Share2 } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import AddExpenseDialog from '@/components/expenses/add-expense-dialog'
import ExpenseListRealtime from '@/components/expenses/expense-list-realtime'
import BalanceSummaryRealtime from '@/components/expenses/balance-summary-realtime'
import InviteCodeCard from '@/components/groups/invite-code-card'
import DeleteGroupButton from '@/components/groups/delete-group-button'
import { cookies } from 'next/headers'

export default async function GroupDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  // Get user from cookie as fallback (same as middleware)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  let user = null
  
  // Try to get user from Supabase first
  const supabase = await createClient()
  const {
    data: { user: fetchedUser },
  } = await supabase.auth.getUser()

  user = fetchedUser

  // If getUser() fails but we have a cookie with session data, use cookie data
  if (!user && authCookie) {
    try {
      const cookieValue = JSON.parse(authCookie.value)
      if (cookieValue.user && cookieValue.access_token) {
        user = cookieValue.user
      }
    } catch (e) {
      // Cookie parsing failed, ignore
    }
  }

  if (!user) {
    redirect('/login')
  }

  const group = await getGroupById(params.id)

  if (!group) {
    redirect('/dashboard')
  }

  const expenses = await getGroupExpenses(params.id)
  const calculationResult = await calculateGroupBalancesWithCalculation(params.id)

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Powrót do Panelu</span>
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <p className="text-muted-foreground mt-2 flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {group.members.length} {group.members.length === 1 ? 'członek' : group.members.length < 5 ? 'członków' : 'członków'}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{expenses.length} {expenses.length === 1 ? 'wydatek' : expenses.length < 5 ? 'wydatki' : 'wydatków'}</span>
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {user && user.id === group.created_by && (
                <DeleteGroupButton groupId={params.id} groupName={group.name} />
              )}
              <AddExpenseDialog groupId={params.id} members={group.members} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wydatki</CardTitle>
                <CardDescription>
                  Wszystkie wydatki w tej grupie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseListRealtime 
                  groupId={params.id} 
                  initialExpenses={expenses}
                  currentUserId={user?.id}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <InviteCodeCard 
              inviteCode={(group as any).invite_code || ''}
              groupId={params.id}
            />
            <BalanceSummaryRealtime
              groupId={params.id}
              initialCalculation={calculationResult}
            />
          </div>
        </div>
      </div>
    </>
  )
}

