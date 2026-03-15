'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProposal(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const city = formData.get('city') as string
  const duration = parseInt(formData.get('duration') as string || '30')

  const { error } = await supabase
    .from('proposals')
    .insert({
      title,
      description,
      category,
      locality: city,
      created_by: user.id,
      duration_days: duration,
      expires_at: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
    })

  if (error) return { error: error.message }

  revalidatePath('/proposals')
  return { success: true }
}

export async function castVote(proposalId: string, voteType: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('proposal_votes')
    .upsert({
      proposal_ref: proposalId,
      user_ref: user.id,
      vote_type: voteType
    })

  if (error) return { error: error.message }

  revalidatePath(`/proposals/${proposalId}`)
  return { success: true }
}
