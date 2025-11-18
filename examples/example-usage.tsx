/**
 * Example usage of database functions in Next.js components
 * 
 * This file demonstrates how to use the CRUD functions in:
 * - Server Components
 * - Client Components
 * - API Routes
 */

// ============================================
// SERVER COMPONENT EXAMPLE
// ============================================
/*
import { getUserGroups, getGroupById } from '@/lib/db/groups'
import { getGroupExpenses } from '@/lib/db/expenses'
import { calculateGroupBalances } from '@/lib/db/balances'

export default async function GroupPage({ params }: { params: { id: string } }) {
  const group = await getGroupById(params.id)
  const expenses = await getGroupExpenses(params.id)
  const balances = await calculateGroupBalances(params.id)

  if (!group) {
    return <div>Group not found</div>
  }

  return (
    <div>
      <h1>{group.name}</h1>
      <h2>Members</h2>
      <ul>
        {group.members.map((member) => (
          <li key={member.id}>
            {member.profile.name} ({member.profile.email})
          </li>
        ))}
      </ul>
      
      <h2>Expenses</h2>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            {expense.description}: ${expense.amount} paid by {expense.payer.name}
          </li>
        ))}
      </ul>

      <h2>Balances</h2>
      <ul>
        {balances.map((balance) => (
          <li key={balance.userId}>
            {balance.userName}: ${balance.netBalance.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  )
}
*/

// ============================================
// CLIENT COMPONENT EXAMPLE
// ============================================
/*
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserGroups, createGroup } from '@/lib/db/groups'

export default function GroupsList() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGroups() {
      // In client components, you need to use API routes or direct Supabase client
      const response = await fetch('/api/groups')
      const data = await response.json()
      setGroups(data)
      setLoading(false)
    }

    loadGroups()
  }, [])

  const handleCreateGroup = async () => {
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Group' }),
    })
    const newGroup = await response.json()
    setGroups([...groups, newGroup])
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <button onClick={handleCreateGroup}>Create Group</button>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>{group.name}</li>
        ))}
      </ul>
    </div>
  )
}
*/

// ============================================
// API ROUTE EXAMPLE
// ============================================
/*
// app/api/groups/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserGroups, createGroup } from '@/lib/db/groups'

export async function GET() {
  try {
    const groups = await getUserGroups()
    return NextResponse.json(groups)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const group = await createGroup(name)
    
    if (!group) {
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      )
    }

    return NextResponse.json(group)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}
*/

// ============================================
// DIRECT SUPABASE CLIENT EXAMPLE (Client Component)
// ============================================
/*
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export default function DirectSupabaseExample() {
  const [groups, setGroups] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function loadGroups() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .or(`created_by.eq.${user.id},id.in.(select group_id from group_members where user_id.eq.${user.id})`)

      if (error) {
        console.error('Error:', error)
        return
      }

      setGroups(data || [])
    }

    loadGroups()
  }, [supabase])

  return (
    <div>
      <h1>My Groups</h1>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>{group.name}</li>
        ))}
      </ul>
    </div>
  )
}
*/

// ============================================
// CREATE EXPENSE EXAMPLE
// ============================================
/*
import { createExpense } from '@/lib/db/expenses'

// Example: Create an expense where 3 people split a $100 dinner
const expense = await createExpense({
  groupId: 'group-uuid',
  payerId: 'user-uuid-who-paid',
  amount: 100,
  description: 'Dinner at Restaurant',
  date: '2024-01-15',
  splits: [
    { userId: 'user-1', shareAmount: 33.33 },
    { userId: 'user-2', shareAmount: 33.33 },
    { userId: 'user-3', shareAmount: 33.34 },
  ],
})
*/

// ============================================
// CALCULATE BALANCES EXAMPLE
// ============================================
/*
import { calculateGroupBalances, getSimplifiedBalances } from '@/lib/db/balances'

// Get detailed balances
const balances = await calculateGroupBalances('group-uuid')
// Returns: [{ userId, userName, totalOwed, totalPaid, netBalance }, ...]

// Get simplified "who owes whom" summary
const simplified = await getSimplifiedBalances('group-uuid')
// Returns: [{ fromUserId, fromUserName, toUserId, toUserName, amount }, ...]
*/








