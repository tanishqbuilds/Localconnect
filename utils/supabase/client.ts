import { createBrowserClient } from '@supabase/ssr'
import { applyTelemetryProxy } from './telemetry'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return applyTelemetryProxy(client)
}
