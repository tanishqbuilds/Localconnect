import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreatePostForm, PostItem } from './FeedInteractive'
import { Megaphone, Vote, Heart, Calendar, Zap, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function CommunityFeedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Fetch Social Posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      post_id, content, media, created_at,
      user:user_ref (name, user_id),
      likes:likes (like_id, user_ref),
      comments:comments (comment_id, text, commented_at, user:user_ref (name))
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // 2. Fetch Active Proposals
  const { data: proposals } = await supabase
    .from('proposals')
    .select('proposal_id, title, category, created_at, status')
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
    .limit(3)

  // 3. Fetch Help Requests
  const { data: helpRequests } = await supabase
    .from('help_requests')
    .select('request_id, title, category, urgency, created_at')
    .eq('status', 'Open')
    .order('created_at', { ascending: false })
    .limit(3)

  // 4. Fetch Alerts
  const { data: alerts } = await supabase
    .from('community_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2)

  // Combine and sort for a true unified feed would be better, but for now we'll show them as sections or a mix.
  // Let's create a combined "Feed Activity" array.
  const activity: any[] = [
    ...(posts || []).map(p => ({ ...p, type: 'post' })),
    ...(proposals || []).map(p => ({ ...p, type: 'proposal' })),
    ...(helpRequests || []).map(h => ({ ...h, type: 'help' })),
    ...(alerts || []).map(a => ({ ...a, type: 'alert' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
               <Megaphone className="w-8 h-8 text-primary-600" /> News Feed
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Everything happening in your locality, aggregated in one place.
            </p>
          </div>

          <CreatePostForm />

          <div className="space-y-6 mt-10">
            {activity.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                  <p className="text-slate-500 font-medium text-lg">Your feed is quiet...</p>
                  <p className="text-sm text-slate-400 mt-1">Start a discussion or report an issue to get things moving.</p>
               </div>
            ) : (
              activity.map((item) => {
                if (item.type === 'post') {
                  return <PostItem key={item.post_id} post={item} currentUserId={user.id} />
                }
                
                if (item.type === 'proposal') {
                  return (
                    <div key={item.proposal_id} className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 flex items-start gap-4">
                      <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                        <Vote className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">New Proposal</span>
                          <span className="text-slate-300 text-xs text-[10px]">•</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(item.created_at))} ago</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                        <Link href={`/proposals/${item.proposal_id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
                          Cast your vote →
                        </Link>
                      </div>
                    </div>
                  )
                }

                if (item.type === 'help') {
                  return (
                    <div key={item.request_id} className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100 flex items-start gap-4">
                      <div className="bg-rose-500 p-3 rounded-2xl text-white shadow-lg shadow-rose-500/30">
                        <Heart className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${item.urgency === 'Emergency' ? 'text-red-600' : 'text-rose-600'}`}>
                            Help Required: {item.urgency}
                          </span>
                          <span className="text-slate-300 text-xs text-[10px]">•</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(item.created_at))} ago</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                        <Link href={`/help/${item.request_id}`} className="text-sm font-bold text-rose-600 hover:text-rose-700 underline underline-offset-4">
                          Offer assistance →
                        </Link>
                      </div>
                    </div>
                  )
                }

                if (item.type === 'alert') {
                  return (
                    <div key={item.alert_id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex items-start gap-4 text-white">
                      <div className="bg-primary-500 p-3 rounded-2xl text-white shadow-lg shadow-primary-500/30">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">OFFICIAL ALERT</span>
                          <span className="text-white/20 text-xs text-[10px]">•</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(item.created_at))} ago</span>
                        </div>
                        <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                        <p className="text-slate-400 text-sm mb-3">{item.content}</p>
                        <div className="text-[10px] font-black uppercase tracking-tighter text-white/50">
                           Broadcast to {item.broadcast_city}
                        </div>
                      </div>
                    </div>
                  )
                }

                return null
              })
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="hidden lg:block space-y-8 pt-20">
           {/* Smart Neighborhood Alerts Widget */}
           <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Zap className="w-4 h-4 text-primary-600" /> Active Alerts
              </h3>
              <div className="space-y-4">
                 {alerts?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No alerts in your area right now.</p>
                 ) : (
                    alerts?.map(alert => (
                       <div key={alert.alert_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                          <p className="text-xs font-bold text-slate-900 mb-1">{alert.title}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-2">{alert.content}</p>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Upcoming Events Widget */}
           <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-amber-600" /> Community Events
              </h3>
              <div className="space-y-6">
                 <div className="flex items-start gap-4">
                    <div className="bg-amber-100 text-amber-700 w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0">
                       <span className="text-[10px] font-black leading-none">MAR</span>
                       <span className="text-xl font-black">22</span>
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-800 leading-tight">Beach Cleanup Drive</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Juhu Beach • 7:00 AM</p>
                    </div>
                 </div>
                 <Link href="/events" className="block text-center py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                    Find more events
                 </Link>
              </div>
           </div>

           {/* Safety Widget */}
           <div className="bg-orange-500 rounded-[2rem] p-8 text-white shadow-xl shadow-orange-500/20">
              <ShieldAlert className="w-10 h-10 mb-4 opacity-50" />
              <h3 className="text-xl font-black mb-2 leading-tight">Public Safety Reporting</h3>
              <p className="text-orange-100 text-xs mb-6 leading-relaxed">
                 Spot a broken streetlight or hazardous road? Report it directly to officials.
              </p>
              <Link href="/safety" className="block text-center py-3 bg-white rounded-2xl text-xs font-black text-orange-600 uppercase tracking-widest hover:bg-orange-50 transition-colors">
                Report Hazard
              </Link>
           </div>
        </div>
      </div>
    </div>
  )
}
