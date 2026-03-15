import { createClient } from '@/utils/supabase/server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let reputation = 0;
  let role = user?.user_metadata?.role || 'citizen';

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('reputation_score, role')
      .eq('user_id', user.id)
      .single();
    
    if (profile) {
      reputation = profile.reputation_score || 0;
      role = profile.role;
    }
  }

  return (
    <NavbarClient user={user} role={role} reputation={reputation} />
  )
}
