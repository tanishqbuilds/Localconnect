'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfilePhoto(photoUrl: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('users')
    .update({ photo_url: photoUrl })
    .eq('user_id', user.id)

  if (error) {
    console.error('Update profile photo error:', error)
    throw new Error('Failed to update profile photo')
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard/citizen')
  revalidatePath('/dashboard/officer')
  return { success: true }
}

export async function updateProfileDetails(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const city = formData.get('city') as string

  const { error } = await supabase
    .from('users')
    .update({ 
      name, 
      phone,
      city
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('Update profile details error:', error)
    throw new Error('Failed to update profile details')
  }

  revalidatePath('/profile')
  return { success: true }
}
