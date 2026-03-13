'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFollow(targetId: string, currentlyFollowing: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (targetId === user.id) return { error: 'Cannot follow yourself' }

  if (currentlyFollowing) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ follower: user.id, following: targetId })
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('follows')
      .insert([{ follower: user.id, following: targetId }])
    if (error) return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}
