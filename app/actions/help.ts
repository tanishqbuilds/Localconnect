'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createHelpRequest(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const urgency = formData.get('urgency') as string
  const area = formData.get('area') as string
  const city = formData.get('city') as string
  const pincode = formData.get('pincode') as string
  const lat = parseFloat(formData.get('lat') as string || '0')
  const lng = parseFloat(formData.get('lng') as string || '0')
  const contact = formData.get('contact') as string
  const hours = parseInt(formData.get('hours') as string || '24')

  // 1. Create location
  const { data: loc, error: locError } = await supabase
    .from('locations')
    .insert({
      area,
      city,
      pincode,
      latitude: lat,
      longitude: lng,
      state: 'Maharashtra'
    })
    .select()
    .single()

  if (locError) return { error: locError.message }

  // 2. Create help request
  const { error } = await supabase
    .from('help_requests')
    .insert({
      user_ref: user.id,
      title,
      description,
      category,
      urgency,
      location_ref: loc.location_id,
      contact_preference: contact,
      expires_at: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    })

  if (error) return { error: error.message }

  revalidatePath('/help')
  return { success: true }
}

export async function resolveHelpRequest(requestId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('help_requests')
    .update({ status: 'Resolved' })
    .eq('request_id', requestId)
    .eq('user_ref', user.id)

  if (error) return { error: error.message }

  revalidatePath('/help')
  return { success: true }
}
