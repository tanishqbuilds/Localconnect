const supabaseUrl = 'https://oiygctvyeflvmdxwwoui.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9peWdjdHZ5ZWZsdm1keHd3b3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMjIxMjQsImV4cCI6MjA4NDc5ODEyNH0.jMECbwcT03NwpMyJT0ScCQg-KX77XAPFcGcb3zPXsT0'

async function testBroadcast() {
  const res = await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey
    },
    body: JSON.stringify({
      messages: [{
        topic: "realtime:adbms-telemetry",
        event: "telemetry",
        payload: { test: 123 }
      }]
    })
  })
  
  const text = await res.text()
  console.log('Status', res.status)
  console.log('Response', text)
}

testBroadcast()
