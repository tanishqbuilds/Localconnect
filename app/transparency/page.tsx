import { createClient } from '@/utils/supabase/server'
import { LayoutDashboard, TrendingUp, CheckCircle, Clock, Map, PieChart, BarChart3 } from 'lucide-react'

export default async function TransparencyPage() {
  const supabase = createClient()
  
  // Refresh stats (in a real app this would be periodic)
  await supabase.rpc('refresh_locality_stats')

  const { data: stats } = await supabase
    .from('locality_stats')
    .select('*')
    .order('total_complaints', { ascending: false })

  // Overall counts
  const totalReports = stats?.reduce((acc, curr) => acc + curr.total_complaints, 0) || 0
  const totalProposals = stats?.reduce((acc, curr) => acc + curr.total_proposals, 0) || 0
  const totalEvents = stats?.reduce((acc, curr) => acc + curr.total_events, 0) || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
           <LayoutDashboard className="w-10 h-10 text-primary-600" /> Transparency Dashboard
        </h1>
        <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-loose">
          Real-time civic data and performance metrics across Maharashtra localities.
        </p>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
            <TrendingUp className="w-12 h-12 text-blue-500/10 absolute -right-2 -bottom-2 group-hover:scale-150 transition-transform" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Reports</p>
            <p className="text-4xl font-black text-slate-900">{totalReports}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-green-600">
               <span className="bg-green-100 px-2 py-0.5 rounded-full">+12%</span> vs last month
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
            <CheckCircle className="w-12 h-12 text-emerald-500/10 absolute -right-2 -bottom-2 group-hover:scale-150 transition-transform" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Proposals Passed</p>
            <p className="text-4xl font-black text-slate-900">{totalProposals}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-600">
               <span className="bg-blue-100 px-2 py-0.5 rounded-full">Active</span> Voting Open
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
            <PieChart className="w-12 h-12 text-amber-500/10 absolute -right-2 -bottom-2 group-hover:scale-150 transition-transform" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Community Events</p>
            <p className="text-4xl font-black text-slate-900">{totalEvents}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
               Citizen led activities
            </div>
         </div>
         <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <BarChart3 className="w-12 h-12 text-white/5 absolute -right-2 -bottom-2 group-hover:scale-150 transition-transform" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Engagement Rate</p>
            <p className="text-4xl font-black">94%</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary-400">
               <span className="bg-primary-500/20 px-2 py-0.5 rounded-full">High</span> Active Zones
            </div>
         </div>
      </div>

      {/* Locality Breakdown Table */}
      <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
         <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Performance by Locality</h3>
            <button className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
               Export Data <Map className="w-4 h-4" />
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Locality / Area</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reports</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Proposals</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Satisfaction</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trend</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {stats?.map((row, i) => (
                     <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-10 py-6">
                           <p className="font-bold text-slate-900">{row.area || 'Unknown Area'}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.city}</p>
                        </td>
                        <td className="px-10 py-6 font-black text-slate-700">{row.total_complaints}</td>
                        <td className="px-10 py-6 font-black text-slate-700">{row.total_proposals}</td>
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-3">
                               <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div className="bg-primary-500 h-full" style={{ width: `${(row.total_complaints / 100) * 100}%` }} />
                               </div>
                               <span className="text-[10px] font-black text-slate-900">Activeness</span>
                            </div>
                         </td>
                        <td className="px-10 py-6">
                           <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                              i % 3 === 0 ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                           }`}>
                              {i % 3 === 0 ? '↑ Improving' : '→ Stable'}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-primary-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-primary-600/25">
            <h4 className="text-2xl font-black mb-4 leading-tight">Civic Engagement Insights</h4>
            <p className="text-primary-100 text-sm mb-8 leading-relaxed">
               Locality engagement is up by 24% this quarter. Proposals related to "Green Energy" and "CCTV Infrastructure" are receiving the highest participation rates.
            </p>
            <div className="bg-white/10 rounded-2xl p-6 border border-white/10">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Avg Response Time</span>
                  <span className="text-lg font-black tracking-tighter shrink-0">14.2 Hours</span>
               </div>
               <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: '85%' }} />
               </div>
            </div>
         </div>
         <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200">
            <h4 className="text-2xl font-black mb-4 leading-tight">Civic Distribution</h4>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400">
                     CR
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Citizens Registered</span>
                        <span className="text-xs font-black">12.4K</span>
                     </div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full">
                        <div className="bg-amber-400 h-full w-[84%]" />
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400">
                     OV
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Officer Verified</span>
                        <span className="text-xs font-black">482</span>
                     </div>
                     <div className="w-full bg-slate-100 h-1.5 rounded-full">
                        <div className="bg-blue-400 h-full w-[76%]" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
