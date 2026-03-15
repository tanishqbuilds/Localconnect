'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function broadcastAlert(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const level = formData.get('level') as 'Info' | 'Warning' | 'Emergency'
  const city = formData.get('city') as string
  const hours = parseInt(formData.get('hours') as string || '24')

  const { error } = await supabase
    .from('community_alerts')
    .insert({
      title,
      content,
      alert_level: level,
      broadcast_city: city,
      expires_at: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    })

  if (error) return { error: error.message }

  revalidatePath('/alerts')
  revalidatePath('/feed')
  return { success: true }
}
