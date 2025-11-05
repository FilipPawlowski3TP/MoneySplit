import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/lib/supabase/types'

/**
 * Get current user's profile
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Get profile by ID
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Update current user's profile
 */
export async function updateProfile(
  updates: Partial<Pick<Profile, 'name' | 'email'>>
): Promise<Profile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

/**
 * Search profiles by email or name
 */
export async function searchProfiles(query: string): Promise<Profile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching profiles:', error)
    return []
  }

  return data || []
}



