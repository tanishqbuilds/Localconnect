'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registerBusiness(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
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
    .from('businesses')
    .insert({
      owner_ref: user.id,
      name,
      category,
      description,
      contact_info: { phone, email },
      location_ref: loc.location_id
    })

  if (error) return { error: error.message }

  revalidatePath('/directory')
  return { success: true }
}

export async function addBusinessReview(businessId: string, rating: number, comment: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('business_reviews')
    .upsert({
      business_ref: businessId,
      user_ref: user.id,
      rating,
      comment
    })

  if (error) return { error: error.message }

  revalidatePath(`/directory/${businessId}`)
  return { success: true }
}
