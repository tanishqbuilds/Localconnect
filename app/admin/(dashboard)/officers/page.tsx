import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import OfficerApprovalClient from './OfficerApprovalClient'

export default async function OfficerApprovalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  // Fetch officers with their user info
  const { data: officers, error } = await supabase
    .from('officers')
    .select(`
      officer_id,
      department,
      designation,
      is_approved,
      id_document_url,
      additional_document_url,
      created_at,
      user:user_id (name, email, phone)
    `)
    .order('is_approved', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching officers:', error.message)
  }

  // Map the response to ensure `user` is an object, not an array
  const formattedOfficers = (officers || []).map((o: any) => ({
    ...o,
    user: Array.isArray(o.user) ? o.user[0] : o.user
  }))

  return <OfficerApprovalClient officers={formattedOfficers} />
}
