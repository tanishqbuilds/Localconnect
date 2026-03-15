import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Zap, Clock, MapPin, ShieldAlert, Info, PlusCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function AlertsPage() {
  const supabase = createClient()
  const { data: alerts } = await supabase
    .from('community_alerts')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Zap className="w-10 h-10 text-primary-600 fill-primary-600" /> Community Alerts
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest">Real-time neighborhood broadcasts</p>
        </div>
        <Link
          href="/alerts/new"
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-xl hover:bg-primary-600 hover:-translate-y-1 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> Broadcast Alert
        </Link>
      </div>

      <div className="space-y-8">
        {alerts?.map((alert) => (
          <div key={alert.alert_id} className={`group relative rounded-[2.5rem] p-10 overflow-hidden transition-all hover:shadow-2xl ${
            alert.alert_level === 'Emergency' ? 'bg-red-600 text-white shadow-red-500/20' :
            alert.alert_level === 'Warning' ? 'bg-amber-400 text-slate-900 shadow-amber-500/20' :
            'bg-white text-slate-900 border border-slate-200 shadow-sm'
          }`}>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className={`p-4 rounded-3xl shrink-0 ${
                alert.alert_level === 'Emergency' ? 'bg-white/20' :
                alert.alert_level === 'Warning' ? 'bg-slate-900/10' :
                'bg-primary-50 text-primary-600'
              }`}>
                {alert.alert_level === 'Emergency' ? <ShieldAlert className="w-10 h-10" /> :
                 alert.alert_level === 'Warning' ? <Zap className="w-10 h-10" /> :
                 <Info className="w-10 h-10" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                   <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                     alert.alert_level === 'Emergency' ? 'bg-white/20' :
                     alert.alert_level === 'Warning' ? 'bg-slate-900/10' :
                     'bg-primary-100 text-primary-700'
                   }`}>
                     {alert.alert_level} Alert
                   </span>
                   <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                     alert.alert_level === 'Emergency' ? 'text-white/60' : 'text-slate-400'
                   }`}>
                      <Clock className="w-3.5 h-3.5" /> {formatDistanceToNow(new Date(alert.created_at))} ago
                   </span>
                </div>

                <h3 className="text-3xl font-black mb-4 leading-tight tracking-tight">{alert.title}</h3>
                <p className={`text-lg leading-relaxed mb-8 ${
                   alert.alert_level === 'Emergency' ? 'text-white/80' : 'text-slate-500'
                }`}>
                  {alert.content}
                </p>

                <div className="flex items-center gap-6">
                   <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                      alert.alert_level === 'Emergency' ? 'text-white' : 'text-slate-900'
                   }`}>
                      <MapPin className="w-4 h-4 opacity-50" />
                      {alert.broadcast_city}
                   </div>
                   <div className={`h-1 flex-1 rounded-full ${
                      alert.alert_level === 'Emergency' ? 'bg-white/20' : 'bg-slate-100'
                   }`} />
                   <div className={`text-[10px] font-bold uppercase ${
                      alert.alert_level === 'Emergency' ? 'text-white/60' : 'text-slate-400'
                   }`}>
                      Expires in {formatDistanceToNow(new Date(alert.expires_at))}
                   </div>
                </div>
              </div>
            </div>

            {/* Aesthetic Background Elements */}
            {alert.alert_level === 'Emergency' && (
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 blur-[100px] rounded-full" />
            )}
            <div className={`absolute bottom-0 right-0 p-12 transition-transform duration-500 group-hover:scale-150 ${
               alert.alert_level === 'Emergency' ? 'text-white/5' : 'text-slate-50'
            }`}>
               <Zap className="w-64 h-64" />
            </div>
          </div>
        ))}

        {(!alerts || alerts.length === 0) && (
          <div className="py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
             <Info className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">Atmosphere is calm</p>
             <p className="text-xs text-slate-400 mt-2">No active broadcasts for your locality right now.</p>
          </div>
        )}
      </div>
    </div>
  )
}
