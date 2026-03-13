'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
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
  const department = formData.get('department') as string
  const designation = formData.get('designation') as string

  // Put extra metadata into raw_user_meta_data so our Supabase trigger creates the record accurately
  const meta: any = { name, role, phone }
  if (role === 'officer') {
    meta.department = department
    meta.designation = designation
  }

  let origin = '';
  // Simple check for Origin if possible, else just let supabase default to what is configured in its dashboard
  try {
     origin = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  } catch(e) {}

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
