import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, MapPin, Mail, Phone, Briefcase, 
  Award, Trophy, Star, Zap, Activity,
  CheckCircle2, MessageSquare, Vote, Heart,
  Settings, ExternalLink, Globe, User
} from 'lucide-react'
import ProfilePhotoUpload from './ProfilePhotoUpload'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select(`*, officers (department, designation)`)
    .eq('user_id', user.id)
    .single()

  if (!profile) notFound()

  // Fetch Stats
  const [
    { count: complaintsCount },
    { count: votesCount },
    { count: helpCount }
  ] = await Promise.all([
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('proposal_votes').select('*', { count: 'exact', head: true }).eq('user_ref', user.id),
    supabase.from('help_requests').select('*', { count: 'exact', head: true }).eq('user_ref', user.id),
  ])

  // Get follower count
  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following', user.id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower', user.id)

  const reputation = profile.reputation_score || 0
  
  // Determine Level
  let levelName = 'Active Citizen'
  let levelColor = 'text-blue-600 bg-blue-50 border-blue-100'
  if (reputation > 500) { levelName = 'Local Hero'; levelColor = 'text-purple-600 bg-purple-50 border-purple-100'; }
  if (reputation > 1000) { levelName = 'Ecosystem Pillar'; levelColor = 'text-amber-600 bg-amber-50 border-amber-100'; }
  if (reputation > 2500) { levelName = 'Civic Legend'; levelColor = 'text-emerald-600 bg-emerald-50 border-emerald-100'; }

  // Fetch Top Citizens
  const { data: topCitizens } = await supabase
    .from('users')
    .select('user_id, name, role, reputation_score, photo_url')
    .order('reputation_score', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-32 animate-in fade-in zoom-in duration-1000">
      
      {/* Premium Glass Header Section */}
      <div className="relative group perspective-1000">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-indigo-600/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
        
        <div className="relative bg-white/70 backdrop-blur-3xl rounded-[4rem] shadow-2xl shadow-slate-200/50 border border-white p-2">
          <div className="bg-slate-900 rounded-[3.5rem] h-64 relative overflow-hidden">
             <div className="absolute inset-0 opacity-20">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3b82f6,transparent_70%)]" />
               <Activity className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] text-white opacity-10 rotate-12" />
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>
          
          <div className="px-12 pb-16">
            <div className="relative flex flex-col lg:flex-row lg:items-end justify-between -mt-24 gap-10">
              <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8 text-center lg:text-left">
                <ProfilePhotoUpload initialPhotoUrl={profile.photo_url} userName={profile.name} />
                
                <div className="pb-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                     <h1 className="text-5xl font-black text-slate-900 tracking-tight drop-shadow-sm">{profile.name}</h1>
                     <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border shadow-sm ${levelColor} backdrop-blur-md`}>
                        {levelName}
                     </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-slate-500 font-bold mt-5 justify-center lg:justify-start">
                     <span className="flex items-center gap-2 hover:text-primary-600 transition-colors cursor-default"><Mail className="w-4.5 h-4.5" /> {profile.email}</span>
                     <span className="flex items-center gap-2 capitalize bg-slate-100/50 px-3 py-1 rounded-xl"><Shield className="w-4.5 h-4.5" /> {profile.role}</span>
                     {profile.city && <span className="flex items-center gap-2"><MapPin className="w-4.5 h-4.5" /> {profile.city}, MH</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 p-2 bg-slate-50/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 shadow-inner">
                <div className="px-8 py-5 text-center">
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{followerCount}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Followers</p>
                </div>
                <div className="w-px bg-slate-200 h-10 self-center" />
                <div className="px-8 py-5 text-center">
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{followingCount}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 h-full items-start">
        
        {/* Reputation & Bio - Left Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-10 group">
           <div className="bg-gradient-to-br from-white to-slate-50 rounded-[3rem] p-10 border border-slate-200 shadow-xl relative overflow-hidden hover:shadow-primary-600/5 transition-all duration-700">
              <div className="relative z-10 flex flex-col h-full">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10 border-b border-slate-100 pb-4 w-fit">Civic Trust Identity</h3>
                 
                 <div className="flex items-center gap-8 mb-12 animate-in slide-in-from-left duration-1000">
                    <div className="bg-amber-100 p-6 rounded-[2rem] shadow-lg shadow-amber-200/50 ring-4 ring-white">
                       <Shield className="w-12 h-12 text-amber-600 fill-amber-600" />
                    </div>
                    <div>
                       <p className="text-6xl font-black text-slate-900 tracking-tighter">{reputation}</p>
                       <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1">Points Gained</p>
                    </div>
                 </div>

                 <div className="space-y-8 flex-1">
                    <div className="flex items-end justify-between">
                       <span className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Next Milestone</span>
                       <span className="text-2xl font-black text-primary-600 leading-none">{500 - (reputation % 500)} <span className="text-xs text-slate-400">PTS LEFT</span></span>
                    </div>
                    <div className="w-full bg-slate-200/50 rounded-full h-4 p-1 shadow-inner border border-slate-100">
                       <div 
                         className="bg-gradient-to-r from-primary-600 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-lg shadow-primary-500/30" 
                         style={{ width: `${(reputation % 500) / 5}%` }}
                       />
                    </div>
                 </div>

                 <div className="mt-12 pt-12 border-t border-slate-100 flex items-center justify-around">
                    <div className="text-center group/badge">
                       <div className="bg-amber-50 p-3 rounded-full mb-3 ring-2 ring-transparent group-hover/badge:ring-amber-200 transition-all">
                          <Trophy className="w-6 h-6 text-amber-500" />
                       </div>
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Gold Contributor</p>
                    </div>
                    <div className="text-center group/badge">
                       <div className="bg-blue-50 p-3 rounded-full mb-3 ring-2 ring-transparent group-hover/badge:ring-blue-200 transition-all">
                          <Star className="w-6 h-6 text-blue-500 fill-blue-500" />
                       </div>
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Verified Persona</p>
                    </div>
                    <div className="text-center group/badge">
                       <div className="bg-emerald-50 p-3 rounded-full mb-3 ring-2 ring-transparent group-hover/badge:ring-emerald-200 transition-all">
                          <Globe className="w-6 h-6 text-emerald-500" />
                       </div>
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Local Guide</p>
                    </div>
                 </div>
              </div>
              <Activity className="absolute -bottom-20 -right-20 w-80 h-80 text-primary-600 opacity-[0.03] rotate-45 scale-150 pointer-events-none" />
           </div>

           {/* Locality Leaderboard */}
           <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl overflow-hidden relative">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                 <Zap className="w-4 h-4 text-amber-500" /> Top Influencers
              </h3>
              <div className="space-y-8">
                 {topCitizens?.map((citizen, idx) => (
                    <Link 
                      key={citizen.user_id} 
                      href={`/profile/${citizen.user_id}`}
                      className="flex items-center justify-between group/user transition-all duration-300"
                    >
                       <div className="flex items-center gap-5">
                          <div className="relative">
                             <span className="absolute -top-1 -left-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-slate-300 shadow-sm border border-slate-100 z-10">{idx + 1}</span>
                             <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200 overflow-hidden group-hover/user:scale-110 transition-transform shadow-sm">
                                {citizen.photo_url ? (
                                   <img src={citizen.photo_url} className="w-full h-full object-cover" alt="" />
                                ) : citizen.name.charAt(0)}
                             </div>
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 group-hover/user:text-primary-600 transition-colors uppercase tracking-tight">{citizen.name}</p>
                             <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{citizen.role}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 group-hover/user:bg-primary-50 transition-colors">
                          <Shield className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[11px] font-black text-slate-900">{citizen.reputation_score}</span>
                       </div>
                    </Link>
                 ))}
                 <Link href="/officers" className="block text-center pt-4 text-xs font-black text-primary-600 uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">
                    View Verified Directory →
                 </Link>
              </div>
           </div>
        </div>

        {/* Stats & Detailed Activity - Right Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-10 group">
           
           {/* Grid Stats */}
           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: 'Incidents', val: complaintsCount, icon: MessageSquare, color: 'primary' },
                { label: 'Votes Cast', val: votesCount, icon: Vote, color: 'indigo' },
                { label: 'Lives Impacted', val: helpCount, icon: Heart, color: 'rose' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl text-center group/stat hover:-translate-y-2 transition-all duration-500 h-full flex flex-col items-center justify-center">
                   <div className={`bg-${stat.color}-50 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 group-hover/stat:rotate-12 transition-transform shadow-lg shadow-${stat.color}-100/50`}>
                      <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                   </div>
                   <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{stat.val}</p>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              ))}
           </div>

           {/* Professional Accomplishments */}
           <div className="bg-white rounded-[3.5rem] p-12 border border-slate-200 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-12">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Achievements</h3>
                 <Settings className="w-5 h-5 text-slate-300 hover:text-slate-600 transition-colors cursor-pointer" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="relative group/achv">
                    <div className="absolute -inset-2 bg-emerald-100 rounded-[2.5rem] blur-xl opacity-0 group-hover/achv:opacity-40 transition-opacity duration-700" />
                    <div className="relative p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 h-full">
                       <div className="flex gap-6 items-start">
                          <div className="p-5 bg-white rounded-2xl shadow-lg ring-1 ring-emerald-100">
                             <Shield className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Neighborhood Guardian</h4>
                             <p className="text-sm text-slate-500 mt-2 leading-relaxed font-medium">Verified source for community hazards. Top 10% in locality safety reports.</p>
                             <div className="flex gap-2 mt-5">
                                <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md">LVL 4 Unlocked</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="relative group/achv grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <div className="absolute -inset-2 bg-primary-100 rounded-[2.5rem] blur-xl opacity-0 group-hover/achv:opacity-40 transition-opacity duration-700" />
                    <div className="relative p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 h-full border-dashed border-slate-300">
                       <div className="flex gap-6 items-start">
                          <div className="p-5 bg-white rounded-2xl shadow-lg ring-1 ring-primary-100">
                             <Award className="w-8 h-8 text-primary-200" />
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-slate-400 uppercase tracking-tight">Democracy Pillar</h4>
                             <p className="text-sm text-slate-400 mt-2 leading-relaxed font-medium">Contribute to local governance by voting on 5 more infrastructure proposals.</p>
                             <div className="flex gap-2 mt-5">
                                <span className="text-[9px] font-black bg-slate-200 text-slate-400 px-3 py-1.5 rounded-full uppercase tracking-widest">LOCKED (5/10)</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-14 pt-10 border-t border-slate-100">
                 <div className="bg-slate-900 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 group/cta overflow-hidden relative">
                    <div className="relative z-10">
                       <h4 className="text-2xl font-black text-white tracking-tight mb-2">Build Your Civic Identity</h4>
                       <p className="text-slate-400 text-sm font-medium">Share your public profile with other residents to build trust.</p>
                    </div>
                    <div className="flex gap-4 relative z-10 w-full md:w-auto">
                       <Link 
                         href={`/profile/${user.id}`} 
                         className="flex-1 md:flex-none text-center px-8 py-4 bg-white rounded-2xl text-xs font-black text-slate-900 uppercase tracking-[0.2em] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                       >
                         Public View <ExternalLink className="w-3.5 h-3.5" />
                       </Link>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                       <Zap className="absolute -top-10 -right-10 w-48 h-48 text-white rotate-12" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* CSS Perspetive Support */}
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  )
}
