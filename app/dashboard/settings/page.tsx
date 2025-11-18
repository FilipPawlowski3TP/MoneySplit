import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/db/profiles'
import Navbar from '@/components/layout/navbar'
import SettingsContent from '@/components/settings/settings-content'
import { cookies } from 'next/headers'

export default async function SettingsPage() {
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

  return (
    <>
      <Navbar userProfile={profile} />
      <SettingsContent user={user} profile={profile} />
    </>
  )
}

