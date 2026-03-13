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
  const pincode = formData.get('pincode') as string

  // Handle location: check if exists or insert
  // Since we don't have a perfect deduplication, we just insert a new location for simplicity
  const { data: locationData, error: locError } = await supabase
    .from('locations')
    .insert([{ area, city, pincode }])
    .select('location_id')
    .single()

  if (locError) {
    return { error: locError.message }
  }

  // Get Category ID
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select('category_id')
    .eq('category_name', category_name)
    .single()

  if (catError) {
     return { error: `Category fetch error: ${catError.message}` }
  }

  // File upload logic (optional)
  const image = formData.get('image') as File | null
  let image_url = null
  if (image && image.size > 0) {
    // Generate a unique filename
    const fileExt = image.name.split('.').pop()
    const filename = `${Math.random()}.${fileExt}`
    const { data: imgData, error: imgError } = await supabase
      .storage
      .from('complaints_media') // Make sure this bucket is created in supabase
      .upload(`${user.id}/${filename}`, image)
      
    if (imgError) {
      console.error(imgError)
      // gracefully continue without image or handle error
    } else {
      const { data: urlData } = supabase.storage.from('complaints_media').getPublicUrl(`${user.id}/${filename}`)
      image_url = urlData.publicUrl
    }
  }

  // Insert complaint
  const { error: compError } = await supabase
    .from('complaints')
    .insert([{
       category_ref: catData.category_id,
       location_ref: locationData.location_id,
       description,
       priority,
       created_by: user.id,
       image_url
    }])

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
  const { data: officer } = await supabase.from('officers').select('officer_id').eq('user_id', user.id).single()
  if (!officer) return { error: 'Unauthorized: Officer access required' }

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
