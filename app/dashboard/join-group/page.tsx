import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JoinGroupForm from '@/components/groups/join-group-form'
import Navbar from '@/components/layout/navbar'
import { cookies } from 'next/headers'

export default async function JoinGroupPage({
  searchParams,
}: {
  searchParams: { code?: string }
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

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dołącz do Grupy</h1>
          <p className="text-muted-foreground mt-2">
            Wprowadź kod zaproszenia, aby dołączyć do grupy
          </p>
        </div>
        <JoinGroupForm initialCode={searchParams.code} />
      </div>
    </>
  )
}

