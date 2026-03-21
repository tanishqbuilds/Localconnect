import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { 
  Shield, MapPin, Award, Trophy, Star, Zap, Activity,
  CheckCircle2, MessageSquare, Vote, Heart, UserCircle,
  Briefcase, Globe, Mail
} from 'lucide-react'

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {

  const supabase = createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { id } = await params

  // Fetch the public profile data
  const { data: profile } = await supabase
    .from('users')
    .select(`*, officers (department, designation)`)
    .eq('user_id', id)
    .single()

  if (!profile) notFound()

  // Redirect to my-profile if it's the current user
  if (currentUser?.id === id) {
    redirect('/profile')
  }

  // Fetch Stats
  const [
    { count: complaintsCount },
    { count: votesCount },
    { count: helpCount }
  ] = await Promise.all([
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('user_id', profile.user_id),
    supabase.from('proposal_votes').select('*', { count: 'exact', head: true }).eq('user_ref', profile.user_id),
    supabase.from('help_requests').select('*', { count: 'exact', head: true }).eq('user_ref', profile.user_id),
  ])

  const reputation = profile.reputation_score || 0
  
  let levelName = 'Active Citizen'
  let levelColor = 'text-blue-600 bg-blue-50 border-blue-100'
  if (reputation > 500) { levelName = 'Local Hero'; levelColor = 'text-purple-600 bg-purple-50 border-purple-100'; }
  if (reputation > 1000) { levelName = 'Ecosystem Pillar'; levelColor = 'text-amber-600 bg-amber-50 border-amber-100'; }
  if (reputation > 2500) { levelName = 'Civic Legend'; levelColor = 'text-emerald-600 bg-emerald-50 border-emerald-100'; }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-32 animate-in fade-in zoom-in duration-700">
      
      {/* Premium Glass Header */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900 blur-3xl opacity-20" />
        <div className="relative bg-white/70 backdrop-blur-3xl rounded-[4rem] shadow-2xl border border-white p-2">
          <div className="bg-slate-900 rounded-[3.5rem] h-56 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-transparent opacity-50" />
             <Activity className="absolute -bottom-10 -right-10 w-96 h-96 text-white opacity-5 rotate-12" />
          </div>
          
          <div className="px-12 pb-14">
            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10 -mt-20">
              <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl ring-1 ring-slate-100 overflow-hidden">
                <div className="w-full h-full rounded-[2.2rem] bg-slate-100 flex items-center justify-center text-5xl font-black text-slate-400 border border-slate-200 overflow-hidden">
                  {profile.photo_url ? (
                    <img src={profile.photo_url} className="w-full h-full object-cover" alt="" />
                  ) : profile.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="pb-4 text-center lg:text-left flex-1">
                 <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${levelColor} backdrop-blur-md`}>
                       {levelName}
                    </div>
                 </div>
                 <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-slate-500 font-bold mt-5 justify-center lg:justify-start">
                    <span className="flex items-center gap-2 capitalize bg-slate-100/50 px-3 py-1 rounded-xl"><Shield className="w-4 h-4" /> {profile.role}</span>
                    {profile.city && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {profile.city}, MH</span>}
                 </div>
              </div>

              <div className="bg-amber-50/50 backdrop-blur-md border-2 border-amber-100/50 px-8 py-6 rounded-[2.5rem] shadow-xl shadow-amber-200/20 group-hover:scale-105 transition-transform duration-500">
                 <div className="flex items-center gap-5">
                    <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/40">
                       <Shield className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                       <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{reputation}</p>
                       <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1">Trust Score</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Stats Section */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl space-y-10">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Civic Footprint</h3>
              
              <div className="space-y-6">
                 {[
                   { label: 'Incidents Logged', val: complaintsCount, icon: MessageSquare, color: 'primary' },
                   { label: 'Votes Contributed', val: votesCount, icon: Vote, color: 'indigo' },
                   { label: 'Help Points', val: helpCount, icon: Heart, color: 'rose' },
                 ].map(stat => (
                   <div key={stat.label} className="flex items-center justify-between group/line">
                      <div className="flex items-center gap-4">
                         <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover/line:rotate-12 transition-transform`}>
                            <stat.icon className="w-5 h-5" />
                         </div>
                         <span className="text-sm font-bold text-slate-600">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black text-slate-900">{stat.val}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group/card shadow-primary-900/20">
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <Globe className="w-5 h-5 text-primary-400" />
                    <span className="text-xs font-black text-primary-200 uppercase tracking-widest">Global Ranking</span>
                 </div>
                 <p className="text-4xl font-black tracking-tighter mb-2">TOP 5%</p>
                 <p className="text-sm text-slate-400 font-medium">Ranked among the most active citizens in {profile.city || 'local ecosystem'}.</p>
              </div>
              <Activity className="absolute -bottom-10 -right-10 w-48 h-48 text-white opacity-5 rotate-12 group-hover/card:scale-125 transition-transform duration-700" />
           </div>
        </div>

        {/* Right Details Section */}
        <div className="lg:col-span-8 space-y-10">
           {profile.role === 'officer' && profile.officers && (
             <div className="bg-white rounded-[3.5rem] p-12 border border-slate-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group/off">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full opacity-50 group-hover/off:scale-150 transition-transform duration-700" />
                 
                 <div className="flex items-center gap-10 relative z-10 text-center md:text-left flex-col md:flex-row">
                    <div className="bg-primary-600 p-6 rounded-[2.5rem] shadow-xl shadow-primary-500/30">
                       <Briefcase className="w-12 h-12 text-white" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Verified Professional</h3>
                       <p className="text-4xl font-black text-slate-900 tracking-tight">{profile.officers.designation}</p>
                       <p className="text-lg font-bold text-primary-600 uppercase tracking-tighter mt-1">Department of {profile.officers.department}</p>
                    </div>
                 </div>
                 
                 <div className="relative z-10">
                    <div className="bg-emerald-50 border-2 border-emerald-100 flex items-center gap-3 px-8 py-3.5 rounded-2xl shadow-sm">
                       <Star className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                       <span className="text-sm font-black text-emerald-800 uppercase tracking-widest">Official Status Active</span>
                    </div>
                 </div>
             </div>
           )}

           <div className="bg-white rounded-[3.5rem] p-12 border border-slate-200 shadow-xl">
              <div className="flex items-center gap-4 mb-10">
                 <Award className="w-7 h-7 text-amber-500" />
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Public Recognition</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                 <div className="p-8 bg-slate-50/70 rounded-[2.5rem] border border-slate-100 group/item hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md border border-slate-100 group-hover/item:scale-110 transition-transform">
                       <Trophy className="w-7 h-7 text-amber-500" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Community Pillar</h4>
                    <p className="text-xs text-slate-500 mt-3 font-medium leading-relaxed">Recognized for consistent engagement and high reliability in local resolution voting.</p>
                 </div>

                 <div className="p-8 bg-slate-50/70 rounded-[2.5rem] border border-slate-100 group/item hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-md border border-slate-100 group-hover/item:scale-110 transition-transform">
                       <Zap className="w-7 h-7 text-primary-500" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Catalyst</h4>
                    <p className="text-xs text-slate-500 mt-3 font-medium leading-relaxed">Early adopter and high-impact contributor to the hyperlocal civic ecosystem.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
