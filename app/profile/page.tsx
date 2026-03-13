import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FollowButton from './FollowButton'
import { UserCircle, MapPin, Mail, Phone, Briefcase } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select(`*, officers (department, designation)`)
    .eq('user_id', user.id)
    .single()

  // Get users they follow
  const { data: following } = await supabase
    .from('follows')
    .select('following')
    .eq('follower', user.id)
    
  const followingIds = following?.map(f => f.following) || []

  // Fetch all users to suggest following (excluding self)
  const { data: otherUsers } = await supabase
    .from('users')
    .select('user_id, name, email, role, officers (department)')
    .neq('user_id', user.id)
    .limit(10)

  // Get follower count
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following', user.id)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-32 sm:h-48"></div>
        <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
          <div className="-mt-12 sm:-mt-16 flex items-end sm:items-center justify-between pb-6 border-b border-gray-100">
             <div className="flex items-center space-x-5">
                <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-white bg-slate-100 flex items-center justify-center text-4xl text-slate-400">
                   {profile?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="pt-12 sm:pt-16">
                   <h1 className="text-2xl font-bold text-slate-900 truncate">{profile?.name}</h1>
                   <p className="text-sm font-medium text-slate-500 capitalize">{profile?.role}</p>
                </div>
             </div>
             <div className="hidden sm:flex gap-6 mt-6 sm:mt-16 text-center">
                <div><p className="text-2xl font-bold text-slate-900">{followerCount}</p><p className="text-sm text-slate-500">Followers</p></div>
                <div><p className="text-2xl font-bold text-slate-900">{followingIds.length}</p><p className="text-sm text-slate-500">Following</p></div>
             </div>
          </div>

          <div className="mt-6">
             <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div className="sm:col-span-1">
                   <dt className="text-sm font-medium text-slate-500 flex items-center gap-2"><Mail className="w-4 h-4"/> Email Address</dt>
                   <dd className="mt-1 text-sm text-slate-900">{profile?.email}</dd>
                </div>
                <div className="sm:col-span-1">
                   <dt className="text-sm font-medium text-slate-500 flex items-center gap-2"><Phone className="w-4 h-4"/> Phone Number</dt>
                   <dd className="mt-1 text-sm text-slate-900">{profile?.phone || 'Not provided'}</dd>
                </div>
                {profile?.role === 'officer' && profile?.officers && (
                   <div className="sm:col-span-2">
                     <dt className="text-sm font-medium text-slate-500 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Officer Details</dt>
                     <dd className="mt-1 text-sm text-slate-900">{profile?.officers.department} - {profile?.officers.designation}</dd>
                   </div>
                )}
             </dl>
          </div>
        </div>
      </div>

      <div className="mt-8">
         <h2 className="text-lg font-medium text-slate-900 mb-4">People in your community</h2>
         <div className="bg-white shadow sm:rounded-md border border-gray-100">
            <ul role="list" className="divide-y divide-gray-100">
               {otherUsers?.map(other => (
                  <li key={other.user_id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                           {other.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                           <p className="text-sm font-medium text-slate-900">{other.name}</p>
                           <p className="text-xs text-slate-500 capitalize">
                             {other.role} {other.role === 'officer' && other.officers ? `- ${other.officers.department}` : ''}
                           </p>
                        </div>
                     </div>
                     <FollowButton targetUserId={other.user_id} isFollowing={followingIds.includes(other.user_id)} />
                  </li>
               ))}
               {otherUsers?.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-slate-500">No other members found in your area yet.</li>
               )}
            </ul>
         </div>
      </div>
    </div>
  )
}
