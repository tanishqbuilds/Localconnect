import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ShieldAlert, AlertTriangle, MapPin, Clock, PlusCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function SafetyReportingPage() {
  const supabase = createClient()
  const { data: reports } = await supabase
    .from('safety_reports')
    .select(`
      *,
      location:location_ref (area, city),
      user:user_ref (name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <ShieldAlert className="w-10 h-10 text-orange-600" /> Public Safety
          </h1>
          <p className="text-slate-500 mt-1">Report hazards, broken infrastructure, and safety concerns.</p>
        </div>
        <Link
          href="/safety/report"
          className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-orange-500/25 hover:bg-orange-500 hover:-translate-y-1 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> Report Concern
        </Link>
      </div>

      <div className="space-y-6">
        {reports?.map((report) => (
          <div key={report.report_id} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-lg transition-all border-l-[12px] overflow-hidden relative" style={{ borderLeftColor: 
            report.severity === 'Critical' ? '#ef4444' : 
            report.severity === 'High' ? '#f97316' : 
            report.severity === 'Medium' ? '#facc15' : '#3b82f6' 
          }}>
            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                   <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                     report.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                     report.severity === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                     'bg-blue-50 text-blue-700 border-blue-200'
                   }`}>
                     {report.severity} Severity
                   </span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {formatDistanceToNow(new Date(report.created_at))} ago
                   </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{report.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-3xl">{report.description}</p>
                
                <div className="flex flex-wrap gap-4">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {report.location.area}, {report.location.city}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 uppercase tracking-widest">
                      {report.category}
                   </div>
                </div>
              </div>

              <div className="flex flex-col justify-between items-end gap-6 shrink-0">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className={`text-sm font-black uppercase tracking-tight ${report.status === 'Resolved' ? 'text-green-600' : 'text-slate-900'}`}>
                      {report.status}
                    </p>
                 </div>
                 <Link 
                   href={`/safety/${report.report_id}`}
                   className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary-600 transition-all shadow-lg active:scale-95"
                 >
                    View Details
                 </Link>
              </div>
            </div>
            {report.severity === 'Critical' && (
               <AlertTriangle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 text-red-50 opacity-[0.03] -z-1" />
            )}
          </div>
        ))}

        {(!reports || reports.length === 0) && (
          <div className="py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
             <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="w-12 h-12 text-orange-200" />
             </div>
             <p className="text-slate-500 font-bold text-xl">No hazards reported.</p>
             <p className="text-sm text-slate-400 mt-2">Your neighborhood seems safe. Great job!</p>
          </div>
        )}
      </div>
    </div>
  )
}
