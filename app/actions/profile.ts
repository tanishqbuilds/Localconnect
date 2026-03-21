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

export async function toggleFollow(followingId: string, currentStatus?: boolean) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized', success: false }

    // Check if already following
    const { data: existing } = await supabase
      .from('follows')
      .select('*')
      .eq('follower', user.id)
      .eq('following', followingId)
      .single()

    if (existing) {
      // Unfollow
      const { error } = await supabase.from('follows').delete().eq('follower', user.id).eq('following', followingId)
      if (error) return { error: error.message, success: false }
    } else {
      // Follow
      const { error } = await supabase.from('follows').insert({ follower: user.id, following: followingId })
      if (error) return { error: error.message, success: false }
    }


    revalidatePath(`/profile/${followingId}`)
    return { success: true, isFollowing: !existing, error: undefined as string | undefined }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred', success: false }
  }
}



