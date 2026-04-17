import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oiygctvyeflvmdxwwoui.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9peWdjdHZ5ZWZsdm1keHd3b3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjIxMjQsImV4cCI6MjA4NDc5ODEyNH0.jMECbwcT03NwpMyJT0ScCQg-KX77XAPFcGcb3zPXsT0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('community_alerts').select('*').limit(1)
  console.log('community_alerts output:', JSON.stringify({data, error}, null, 2))

  const { data: hrData, error: hrError } = await supabase.from('help_requests').select('*').limit(1)
  console.log('help_requests output:', JSON.stringify({hrData, hrError}, null, 2))
}

test()
