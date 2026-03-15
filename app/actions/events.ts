'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const date = formData.get('date') as string
  const area = formData.get('area') as string
  const city = formData.get('city') as string
  const lat = parseFloat(formData.get('lat') as string || '0')
  const lng = parseFloat(formData.get('lng') as string || '0')

  // 1. Create location
  const { data: loc, error: locError } = await supabase
    .from('locations')
    .insert({
      area,
      city,
      pincode: formData.get('pincode') as string,
      latitude: lat,
      longitude: lng,
      state: 'Maharashtra'
    })
    .select()
    .single()

  if (locError) return { error: locError.message }

  // 2. Create event
  const { error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      organizer_ref: user.id,
      location_ref: loc.location_id,
      event_date: date,
      category,
      status: 'Planned'
    })

  if (error) return { error: error.message }

  revalidatePath('/events')
  return { success: true }
}

export async function rsvpToEvent(eventId: string, status: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('event_rsvps')
    .upsert({
      event_ref: eventId,
      user_ref: user.id,
      status
    })

  if (error) return { error: error.message }

  revalidatePath('/events')
  return { success: true }
}
