'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reportSafetyConcern(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const severity = formData.get('severity') as 'Low' | 'Medium' | 'High' | 'Critical'
  const area = formData.get('area') as string
  const city = formData.get('city') as string

  const { data: loc, error: locError } = await supabase
    .from('locations')
    .insert({
      area,
      city,
      pincode: formData.get('pincode') as string,
      state: 'Maharashtra'
    })
    .select()
    .single()

  if (locError) return { error: locError.message }

  const { error } = await supabase
    .from('safety_reports')
    .insert({
      user_ref: user.id,
      title,
      description,
      category,
      severity,
      location_ref: loc.location_id
    })

  if (error) return { error: error.message }

  revalidatePath('/safety')
  return { success: true }
}
