'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  if (!content.trim()) return { error: 'Content cannot be empty' }

  const { error } = await supabase
    .from('posts')
    .insert([{ content, user_ref: user.id }])

  if (error) return { error: error.message }
  revalidatePath('/feed')
  return { success: true }
}

export async function createComment(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const post_id = formData.get('post_id') as string
  const text = formData.get('text') as string
  if (!text.trim()) return { error: 'Comment cannot be empty' }

  const { error } = await supabase
    .from('comments')
    .insert([{ text, post_ref: post_id, user_ref: user.id }])

  if (error) return { error: error.message }
  revalidatePath('/feed')
  return { success: true }
}

export async function toggleLike(post_id: string, currentlyLiked: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (currentlyLiked) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .match({ post_ref: post_id, user_ref: user.id })
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('likes')
      .insert([{ post_ref: post_id, user_ref: user.id }])
    if (error) return { error: error.message }
  }

  revalidatePath('/feed')
  return { success: true }
}
