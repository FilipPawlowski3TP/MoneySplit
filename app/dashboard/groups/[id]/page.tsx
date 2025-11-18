import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getGroupById } from '@/lib/db/groups'
import { getGroupExpenses } from '@/lib/db/expenses'
import { calculateGroupBalancesWithCalculation } from '@/lib/db/expense-calculation'
import Navbar from '@/components/layout/navbar'
import GroupDetailsContent from '@/components/groups/group-details-content'
import { getCurrentProfile } from '@/lib/db/profiles'
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
  const profile = await getCurrentProfile()

  return (
    <>
      <Navbar userProfile={profile} />
      <GroupDetailsContent
        group={group}
        expenses={expenses}
        calculationResult={calculationResult}
        currentUserId={user.id}
        isCreator={user.id === group.created_by}
      />
    </>
  )
}

