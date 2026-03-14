'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createComplaint(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const category_name = formData.get('category') as string
  const description = formData.get('description') as string
  const priority = formData.get('priority') as string || 'Medium'
  const area = formData.get('area') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string || 'Maharashtra'
  const pincode = formData.get('pincode') as string
  const lat = parseFloat(formData.get('lat') as string) || null
  const lng = parseFloat(formData.get('lng') as string) || null
  const tagged_officers_raw = formData.get('tagged_officers') as string

  // Parse tagged officers
  let tagged_officers: string[] = []
  try {
    tagged_officers = JSON.parse(tagged_officers_raw || '[]')
  } catch {
    tagged_officers = []
  }

  // Upsert location: check if exists or insert
  let locationId: string | null = null
  const { data: existingLoc } = await supabase
    .from('locations')
    .select('location_id')
    .eq('area', area)
    .eq('city', city)
    .eq('pincode', pincode)
    .maybeSingle()

  if (existingLoc) {
    locationId = existingLoc.location_id
  } else {
    const locInsert: Record<string, unknown> = { area, city, state, pincode }
    if (lat && lng) {
      locInsert.latitude = lat
      locInsert.longitude = lng
    }
    const { data: newLoc, error: locError } = await supabase
      .from('locations')
      .insert([locInsert])
      .select('location_id')
      .single()
    if (locError) return { error: locError.message }
    locationId = newLoc.location_id
  }


  // Get Category ID
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select('category_id')
    .eq('category_name', category_name)
    .single()

  if (catError) {
    return { error: `Category not found: ${catError.message}` }
  }

  // File upload logic (optional)
  const image = formData.get('image') as File | null
  let image_url = null
  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
    const { data: imgData, error: imgError } = await supabase
      .storage
      .from('complaints_media')
      .upload(`${user.id}/${filename}`, image)

    if (imgError) {
      console.error('Image upload error:', imgError)
      // Continue without image
    } else if (imgData) {
      const { data: urlData } = supabase.storage.from('complaints_media').getPublicUrl(`${user.id}/${filename}`)
      image_url = urlData.publicUrl
    }
  }

  // Insert complaint
  const insertPayload: Record<string, unknown> = {
    category_ref: catData.category_id,
    location_ref: locationId,
    description,
    priority,
    state,
    created_by: user.id,
    image_url
  }

  if (tagged_officers.length > 0) {
    insertPayload.tagged_officers = tagged_officers
  }

  const { error: compError } = await supabase
    .from('complaints')
    .insert([insertPayload])

  if (compError) {
    return { error: compError.message }
  }

  revalidatePath('/dashboard/citizen')
  redirect('/dashboard/citizen')
}

export async function updateComplaintStatus(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check if user is officer
  const { data: officer } = await supabase
    .from('officers')
    .select('officer_id, is_approved')
    .eq('user_id', user.id)
    .single()

  if (!officer) return { error: 'Unauthorized: Officer access required' }
  if (!officer.is_approved) return { error: 'Your account is pending approval' }

  const complaint_id = formData.get('complaint_id') as string
  const status = formData.get('status') as string
  const update_text = formData.get('update_text') as string

  // Update status
  const { error: compError } = await supabase
    .from('complaints')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('complaint_id', complaint_id)

  if (compError) return { error: compError.message }

  if (update_text) {
    const { error: statusError } = await supabase
      .from('status_updates')
      .insert([{
        complaint_ref: complaint_id,
        update_text,
        updated_by: officer.officer_id
      }])

    if (statusError) return { error: statusError.message }
  }

  revalidatePath(`/complaints/${complaint_id}`)
  revalidatePath('/dashboard/officer')
  return { success: true }
}
