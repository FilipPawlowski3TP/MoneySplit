import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return []
          const cookies = document.cookie.split(';')
          return cookies.map(cookie => {
            const [name, value] = cookie.trim().split('=')
            return { name, value: decodeURIComponent(value) }
          })
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return
          cookiesToSet.forEach(({ name, value, options }) => {
            // Build cookie string - note: httpOnly cookies cannot be set from client-side
            const cookieOptions = [
              `path=${options?.path || '/'}`,
              `SameSite=${options?.sameSite || 'Lax'}`,
              options?.secure ? 'Secure' : '',
              options?.maxAge ? `Max-Age=${options.maxAge}` : '',
              options?.expires ? `Expires=${options.expires.toUTCString()}` : '',
            ].filter(Boolean).join('; ')
            
            document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions}`
          })
        },
      },
    }
  )
}
