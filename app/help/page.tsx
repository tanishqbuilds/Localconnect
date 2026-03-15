import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PlusCircle, Heart, MapPin, Clock, ShieldAlert, Phone, Mail } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function HelpNetworkPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: requests } = await supabase
    .from('help_requests_with_location')
    .select('*')
    .eq('status', 'Open')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> Neighborhood Help
          </h1>
          <p className="text-slate-500 mt-1">Lend a hand or ask for assistance from neighbors.</p>
        </div>
        <Link
          href="/help/create"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:bg-rose-500 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> Request Help
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests?.map((req) => (
          <div key={req.request_id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border ${
                  req.urgency === 'Emergency' ? 'bg-red-50 text-red-700 border-red-100' :
                  req.urgency === 'High' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  {req.urgency} Urgency
                </span>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(req.expires_at))} left
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-rose-600 transition-colors">
                {req.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                {req.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{req.area}, {req.city}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <ShieldAlert className="w-4 h-4 text-slate-400" />
                  <span>Category: {req.category}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-700">
                  {req.creator_name[0]}
                </div>
                <div className="text-[10px]">
                  <p className="font-bold text-slate-900 leading-none">{req.creator_name}</p>
                  <p className="text-slate-400 mt-0.5">{req.creator_reputation} Rep</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {req.contact_preference === 'Phone' ? (
                  <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 transition-colors shadow-sm">
                    <Phone className="w-4 h-4" />
                  </button>
                ) : (
                  <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 transition-colors shadow-sm">
                    <Mail className="w-4 h-4" />
                  </button>
                )}
                <Link 
                  href={`/help/${req.request_id}`}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  I Can Help
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!requests || requests.length === 0) && (
        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-rose-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">No active requests</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
             Everyone in your neighborhood seems to be doing fine. Why not start something positive by offering resources?
          </p>
        </div>
      )}
    </div>
  )
}
