import { createClient } from '@/utils/supabase/server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = user?.user_metadata?.role || null;

  return (
    <NavbarClient user={user} role={role} />
  )
}
