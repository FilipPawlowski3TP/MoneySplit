import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserGroups } from '@/lib/db/groups'
import Navbar from '@/components/layout/navbar'
import { cookies } from 'next/headers'
import DashboardContent from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
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

  const groups = await getUserGroups()

  return (
    <>
      <Navbar />
      <DashboardContent groups={groups} currentUserId={user.id} />
    </>
  )
}

