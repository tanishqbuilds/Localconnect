'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // Find user's role to redirect correctly
  const { data: userData } = await supabase.auth.getUser()
  const role = userData?.user?.user_metadata?.role || 'citizen'

  revalidatePath('/', 'layout')
  redirect(`/dashboard/${role}`)
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string || 'citizen'
  const phone = formData.get('phone') as string
  const state = formData.get('state') as string || 'Maharashtra'
  const city = formData.get('city') as string

  // Officer-specific fields
  const department = formData.get('department') as string
  const designation = formData.get('designation') as string
  const officer_type = formData.get('officer_type') as string
  const badge_number = formData.get('badge_number') as string
  const id_document_url = formData.get('id_document_url') as string
  const additional_document_url = formData.get('additional_document_url') as string

  // Build metadata for our Supabase trigger
  const meta: Record<string, string> = { name, role, phone, state, city }

  if (role === 'officer') {
    meta.department = department
    meta.designation = designation
    meta.officer_type = officer_type
    meta.badge_number = badge_number || ''
    meta.id_document_url = id_document_url || ''
    meta.additional_document_url = additional_document_url || ''
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: meta
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(`/dashboard/${role}`)
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
