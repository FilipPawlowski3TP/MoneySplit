import { createClient } from '@/lib/supabase/server'
import { Group, GroupWithMembers } from '@/lib/supabase/types'
import { Database } from '@/types/database.types'
import { cookies } from 'next/headers'

/**
 * Generate a unique invite code
 */
function generateInviteCode(): string {
  // Generate a 6-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Create a new group
 */
export async function createGroup(
  name: string
): Promise<Group | null> {
  const supabase = await createClient()

  // Get user from cookie as fallback (same as middleware)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  let user = null
  
  // Try to get user from Supabase first
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
    console.error('No user found in createGroup')
    return null
  }

  // Generate unique invite code (skip if column doesn't exist)
  let inviteCode: string | undefined = generateInviteCode()
  let attempts = 0
  let codeExists = true
  let hasInviteCodeColumn = true

  // Try to check if invite_code column exists by attempting a query
  try {
    // Ensure the code is unique (max 10 attempts)
    while (codeExists && attempts < 10) {
      const { data: existing, error: checkError } = await supabase
        .from('groups')
        .select('id')
        .eq('invite_code', inviteCode)
        .single()

      // If column doesn't exist, skip invite code generation
      if (checkError && (checkError.code === '42703' || checkError.message?.includes('invite_code') || checkError.message?.includes('column'))) {
        console.log('invite_code column does not exist, skipping invite code generation')
        hasInviteCodeColumn = false
        break
      }

      if (!existing) {
        codeExists = false
      } else {
        inviteCode = generateInviteCode()
        attempts++
      }
    }
  } catch (e) {
    console.log('Error checking invite_code, column may not exist:', e)
    hasInviteCodeColumn = false
  }

  // Try to use the SECURITY DEFINER function first
  try {
    console.log('[createGroup] Attempting to use create_group_safe function')
    const { data: functionResult, error: functionError } = await supabase.rpc('create_group_safe', {
      group_name: name,
      creator_id: user.id,
      invite_code_value: hasInviteCodeColumn && inviteCode ? inviteCode : null
    })

    console.log('[createGroup] Function result:', functionResult, 'Error:', functionError)

    if (!functionError && functionResult && functionResult.length > 0) {
      // Function returns the full group object directly
      const createdGroup = functionResult[0] as any
      console.log('[createGroup] Successfully created group via function:', createdGroup)
      return createdGroup as Group
    } else {
      console.log('[createGroup] Function failed or not available, error:', functionError)
    }
  } catch (e) {
    console.log('[createGroup] Exception calling function, using direct insert:', e)
  }

  // Fallback to direct insert if function doesn't exist
  const insertData: any = {
    name,
    created_by: user.id,
  }

  // Only add invite_code if column exists
  if (hasInviteCodeColumn && inviteCode) {
    insertData.invite_code = inviteCode
  }

  const { data, error } = await supabase
    .from('groups')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating group:', error)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error details:', error.details)
    console.error('Error hint:', error.hint)
    
    // Jeśli błąd dotyczy kolumny invite_code (nie istnieje), spróbuj bez niej
    if (error.code === '42703' || error.message?.includes('invite_code')) {
      console.log('Retrying without invite_code (column may not exist)')
      const { data: dataWithoutCode, error: errorWithoutCode } = await supabase
        .from('groups')
        .insert({
          name,
          created_by: user.id,
        })
        .select()
        .single()

      if (errorWithoutCode) {
        console.error('Error creating group without invite_code:', errorWithoutCode)
        return null
      }

      // Add creator as a member
      await supabase.from('group_members').insert({
        group_id: dataWithoutCode.id,
        user_id: user.id,
      })

      return dataWithoutCode
    }
    
    return null
  }

  // Add creator as a member
  await supabase.from('group_members').insert({
    group_id: data.id,
    user_id: user.id,
  })

  return data
}

/**
 * Get all groups for current user
 */
export async function getUserGroups(): Promise<Group[]> {
  const supabase = await createClient()

  // Get user from cookie as fallback (same as middleware)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  let user = null
  
  // Try to get user from Supabase first
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
    console.error('[getUserGroups] No user found')
    return []
  }

  console.log('[getUserGroups] User ID:', user.id)

  // Try to use SECURITY DEFINER function first (bypasses RLS)
  try {
    const { data: functionResult, error: functionError } = await supabase.rpc('get_user_groups_safe', {
      user_id_param: user.id
    })

    console.log('[getUserGroups] Function result:', functionResult?.length || 0, 'Error:', functionError)

    if (!functionError && functionResult && functionResult.length > 0) {
      console.log('[getUserGroups] Successfully fetched groups via function:', functionResult.length)
      return functionResult as Group[]
    } else if (functionError) {
      console.error('[getUserGroups] Function error:', functionError)
    }
  } catch (e) {
    console.log('[getUserGroups] Exception calling function, using direct query:', e)
  }

  // Fallback to direct query (may be blocked by RLS)
  const { data: createdGroups, error: createdError } = await supabase
    .from('groups')
    .select('*')
    .eq('created_by', user.id)

  console.log('[getUserGroups] Created groups (direct):', createdGroups?.length || 0, 'Error:', createdError)

  if (createdError) {
    console.error('[getUserGroups] Error fetching created groups:', createdError)
  }

  // Get group IDs where user is a member
  const { data: memberGroups, error: memberError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  console.log('[getUserGroups] Member groups:', memberGroups?.length || 0, 'Error:', memberError)

  if (memberError) {
    console.error('[getUserGroups] Error fetching member groups:', memberError)
  }

  const memberGroupIds = memberGroups?.map((m) => m.group_id) || []

  // Get groups where user is a member
  const { data: groupsAsMember, error: groupsError } = memberGroupIds.length > 0
    ? await supabase
        .from('groups')
        .select('*')
        .in('id', memberGroupIds)
    : { data: [], error: null }

  console.log('[getUserGroups] Groups as member:', groupsAsMember?.length || 0, 'Error:', groupsError)

  if (groupsError) {
    console.error('[getUserGroups] Error fetching member groups:', groupsError)
  }

  // Combine and deduplicate
  const allGroups = [...(createdGroups || []), ...(groupsAsMember || [])]
  const uniqueGroups = Array.from(
    new Map(allGroups.map((g) => [g.id, g])).values()
  )

  console.log('[getUserGroups] Total unique groups:', uniqueGroups.length)

  return uniqueGroups
}

/**
 * Get group by ID with members
 */
export async function getGroupById(
  groupId: string
): Promise<GroupWithMembers | null> {
  const supabase = await createClient()

  // Get user from cookie as fallback (same as middleware)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  let user = null
  
  // Try to get user from Supabase first
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

  console.log('[getGroupById] Fetching group:', groupId, 'User:', user?.id)

  if (!user) {
    console.error('[getGroupById] No user found')
    return null
  }

  // Try to use SECURITY DEFINER function first (bypasses RLS)
  try {
    const { data: functionResult, error: functionError } = await supabase.rpc('get_group_by_id_safe', {
      group_id_param: groupId,
      user_id_param: user.id
    })

    console.log('[getGroupById] Function result:', functionResult?.length || 0, 'Error:', functionError)

    if (!functionError && functionResult && functionResult.length > 0) {
      const group = functionResult[0] as any
      console.log('[getGroupById] Successfully fetched group via function:', group.name)
      
      // Get members using SECURITY DEFINER function (bypasses RLS)
      const { data: membersData, error: membersFunctionError } = await supabase
        .rpc('get_group_members_safe', {
          group_id_param: groupId,
          user_id_param: user.id,
        })

      let members: any[] = []
      
      if (!membersFunctionError && membersData) {
        members = membersData
        console.log('[getGroupById] Members from function:', members.length)
      } else {
        // Fallback to direct query
        console.log('[getGroupById] Function error, trying direct query:', membersFunctionError)
        const { data: membersDirect, error: membersError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupId)

        if (membersError) {
          console.error('[getGroupById] Error fetching members:', membersError)
        } else {
          members = membersDirect || []
          console.log('[getGroupById] Members from direct query:', members.length)
        }
      }

      // Get profiles for all members and creator
      const userIds = [
        ...(members || []).map((m: any) => m.user_id),
        group.created_by,
      ]
      const uniqueUserIds = [...new Set(userIds)]

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uniqueUserIds)

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

      // Ensure creator is in members list (they might not be in group_members if created before trigger)
      const memberIds = new Set((members || []).map((m: any) => m.user_id))
      const allMembers = [...(members || [])]
      
      // If creator is not in members, add them
      if (!memberIds.has(group.created_by)) {
        allMembers.push({
          user_id: group.created_by,
          group_id: groupId,
          profile: profilesMap.get(group.created_by) || ({} as any),
        } as any)
      }

      const formattedMembers = allMembers.map((member: any) => ({
        ...member,
        profile: profilesMap.get(member.user_id) || ({} as any),
      }))

      console.log('[getGroupById] Members count:', formattedMembers.length)
      console.log('[getGroupById] Members:', formattedMembers.map((m: any) => ({
        user_id: m.user_id,
        name: m.profile?.name || 'No name',
      })))

      return {
        ...group,
        members: formattedMembers,
        created_by_profile: profilesMap.get(group.created_by) || ({} as any),
      } as GroupWithMembers
    } else if (functionError) {
      console.error('[getGroupById] Function error:', functionError)
    }
  } catch (e) {
    console.log('[getGroupById] Exception calling function, using direct query:', e)
  }

  // Fallback to direct query (may be blocked by RLS)
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (groupError || !group) {
    console.error('[getGroupById] Error fetching group:', groupError)
    return null
  }

  console.log('[getGroupById] Group found:', group.name)

  // Get members
  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)

  if (membersError) {
    console.error('Error fetching members:', membersError)
  }

  // Get profiles for all members and creator
  const userIds = [
    ...(members || []).map((m) => m.user_id),
    group.created_by,
  ]
  const uniqueUserIds = [...new Set(userIds)]

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', uniqueUserIds)

  const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  // Ensure creator is in members list (they might not be in group_members if created before trigger)
  const memberIds = new Set((members || []).map((m) => m.user_id))
  const allMembers = [...(members || [])]
  
  // If creator is not in members, add them
  if (!memberIds.has(group.created_by)) {
    allMembers.push({
      user_id: group.created_by,
      group_id: groupId,
      profile: profilesMap.get(group.created_by) || ({} as any),
    } as any)
  }

  const formattedMembers = allMembers.map((member) => ({
    ...member,
    profile: profilesMap.get(member.user_id) || ({} as any),
  }))

  console.log('[getGroupById] Members count (fallback):', formattedMembers.length)
  console.log('[getGroupById] Members (fallback):', formattedMembers.map((m: any) => ({
    user_id: m.user_id,
    name: m.profile?.name || 'No name',
  })))

  return {
    ...group,
    members: formattedMembers,
    created_by_profile: profilesMap.get(group.created_by) || ({} as any),
  }
}

/**
 * Update group
 */
export async function updateGroup(
  groupId: string,
  updates: Partial<Pick<Group, 'name'>>
): Promise<Group | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single()

  if (error) {
    console.error('Error updating group:', error)
    return null
  }

  return data
}

/**
 * Delete group
 */
export async function deleteGroup(groupId: string): Promise<boolean> {
  const supabase = await createClient()

  // Get user from cookie as fallback (same as middleware)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  let user = null
  
  // Try to get user from Supabase first
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
    console.error('[deleteGroup] No user found')
    return false
  }

  // Try to use SECURITY DEFINER function first (bypasses RLS)
  try {
    const { data: functionResult, error: functionError } = await supabase.rpc('delete_group_safe', {
      group_id_param: groupId,
      user_id_param: user.id
    })

    if (!functionError && functionResult === true) {
      console.log('[deleteGroup] Successfully deleted group via function')
      return true
    } else if (functionError) {
      console.error('[deleteGroup] Function error:', functionError)
    }
  } catch (e) {
    console.log('[deleteGroup] Exception calling function, using direct delete:', e)
  }

  // Fallback to direct delete (may be blocked by RLS)
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (error) {
    console.error('[deleteGroup] Error deleting group:', error)
    return false
  }

  return true
}

/**
 * Add member to group
 */
export async function addGroupMember(
  groupId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: userId,
    })

  if (error) {
    console.error('Error adding group member:', error)
    return false
  }

  return true
}

/**
 * Remove member from group
 */
export async function removeGroupMember(
  groupId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing group member:', error)
    return false
  }

  return true
}

/**
 * Join group by invite code
 */
export async function joinGroupByCode(
  inviteCode: string
): Promise<Group | null> {
  const supabase = await createClient()

  // Get user from cookie as fallback (same as middleware)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  let user = null
  
  // Try to get user from Supabase first
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
    console.error('[joinGroupByCode] No user found')
    return null
  }

  console.log('[joinGroupByCode] Attempting to join with code:', inviteCode, 'User:', user.id)

  // Try to use SECURITY DEFINER function first (bypasses RLS)
  try {
    const { data: functionResult, error: functionError } = await supabase.rpc('join_group_by_code_safe', {
      invite_code_param: inviteCode.toUpperCase().trim(),
      user_id_param: user.id
    })

    console.log('[joinGroupByCode] Function result:', functionResult?.length || 0, 'Error:', functionError)

    if (!functionError && functionResult && functionResult.length > 0) {
      const group = functionResult[0] as any
      console.log('[joinGroupByCode] Successfully joined group via function:', group.name)
      return group as Group
    } else if (functionError) {
      console.error('[joinGroupByCode] Function error:', functionError)
    }
  } catch (e) {
    console.log('[joinGroupByCode] Exception calling function, using direct query:', e)
  }

  // Fallback to direct query (may be blocked by RLS)
  // Find group by invite code
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()

  if (groupError || !group) {
    console.error('[joinGroupByCode] Error finding group by invite code:', groupError)
    return null
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (existingMember) {
    // User is already a member, return group
    return group
  }

  // Add user as a member
  const { error: memberError } = await supabase
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
    })

  if (memberError) {
    console.error('[joinGroupByCode] Error adding group member:', memberError)
    return null
  }

  return group
}

/**
 * Get group by invite code
 */
export async function getGroupByInviteCode(
  inviteCode: string
): Promise<Group | null> {
  const supabase = await createClient()

  // Try to use SECURITY DEFINER function first (bypasses RLS)
  try {
    const { data: functionResult, error: functionError } = await supabase.rpc('get_group_by_invite_code_safe', {
      invite_code_param: inviteCode.toUpperCase().trim()
    })

    if (!functionError && functionResult && functionResult.length > 0) {
      const group = functionResult[0] as any
      console.log('[getGroupByInviteCode] Successfully found group via function:', group.name)
      return group as Group
    } else if (functionError) {
      console.error('[getGroupByInviteCode] Function error:', functionError)
    }
  } catch (e) {
    console.log('[getGroupByInviteCode] Exception calling function, using direct query:', e)
  }

  // Fallback to direct query (may be blocked by RLS)
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single()

  if (error || !group) {
    console.error('[getGroupByInviteCode] Error finding group by invite code:', error)
    return null
  }

  return group
}

