import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/db/profiles'
import { getUserGroups } from '@/lib/db/groups'
import Navbar from '@/components/layout/navbar'
import ProfileContent from '@/components/profile/profile-content'
import { cookies } from 'next/headers'

export default async function ProfilePage() {
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

  const profile = await getCurrentProfile()
  const groups = await getUserGroups()

  // Calculate stats - fetch expenses from all groups
  let totalExpenses = 0
  let totalBalance = 0

  for (const group of groups) {
    try {
      const { getGroupExpenses } = await import('@/lib/db/expenses')
      const { calculateGroupBalancesWithCalculation } = await import('@/lib/db/expense-calculation')
      
      const expenses = await getGroupExpenses(group.id)
      const calculation = await calculateGroupBalancesWithCalculation(group.id)
      
      totalExpenses += expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
      
      const userBalance = calculation.balances.find((b: any) => b.userId === user.id)
      if (userBalance) {
        totalBalance += userBalance.netBalance || 0
      }
    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

  return (
    <>
      <Navbar userProfile={profile} />
      <ProfileContent 
        profile={profile} 
        currentUserId={user.id}
        stats={{
          activeGroups: groups.length,
          totalExpenses,
          totalBalance,
        }}
      />
    </>
  )
}

