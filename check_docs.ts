import { createClient } from '@supabase/supabase-js'

const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supaKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supaUrl || !supaKey) {
  console.error("Missing supabase credentials")
  process.exit(1)
}

const supabase = createClient(supaUrl, supaKey)

async function check() {
  const { data, error } = await supabase.from('officers').select('*')
  if (error) {
    console.error("Error:", error)
  } else {
    for (const d of data) {
      console.log(`Officer: ${d.officer_id}, Approved: ${d.is_approved}, ID Doc: ${d.id_document_url}, Add Doc: ${d.additional_document_url}`)
    }
  }
}

check()
