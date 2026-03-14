'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Admin login action — validates that the user has admin role
export async function adminLogin(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    await supabase.auth.signOut()
    return { error: 'Authentication failed.' }
  }

  // Check role from the users table
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: 'Not authorized. Admin access only.' }
  }

  revalidatePath('/admin', 'layout')
  redirect('/admin')
}

// Approve an officer
export async function approveOfficer(officerId: string) {
  const supabase = createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: admin } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (admin?.role !== 'admin') return { error: 'Not authorized' }

  const { error } = await supabase
    .from('officers')
    .update({ is_approved: true })
    .eq('officer_id', officerId)

  if (error) return { error: error.message }

  revalidatePath('/admin/officers')
  return { success: true }
}

// Reject an officer (delete officer record and update user role to citizen)
export async function rejectOfficer(officerId: string) {
  const supabase = createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: admin } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (admin?.role !== 'admin') return { error: 'Not authorized' }

  // Get the officer's user_id first
  const { data: officer } = await supabase
    .from('officers')
    .select('user_id')
    .eq('officer_id', officerId)
    .single()

  if (!officer) return { error: 'Officer not found' }

  // Delete officer record
  const { error: deleteError } = await supabase
    .from('officers')
    .delete()
    .eq('officer_id', officerId)

  if (deleteError) return { error: deleteError.message }

  // Update user role to citizen
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: 'citizen' })
    .eq('user_id', officer.user_id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/admin/officers')
  return { success: true }
}
