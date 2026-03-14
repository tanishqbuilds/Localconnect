import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Filter, MapPin, ClipboardList, Clock, ShieldAlert,
  CheckCircle, AlertCircle, TrendingUp, Users, Tag, Star
} from 'lucide-react'
import { OFFICER_TYPE_COLORS } from '@/utils/constants'

export default async function OfficerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; view?: string }>
}) {
  const params = await searchParams
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: officer } = await supabase
    .from('officers')
    .select(`
      *,
      user_info:user_id (name, email, phone)
    `)
    .eq('user_id', user.id)
    .single()

  // If officer is not found, redirect them
  if (!officer) {
    redirect('/dashboard/citizen')
  }

  // Pending approval screen
  if (officer && !officer.is_approved) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Registration Under Review</h1>
          <p className="text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
            Your officer registration is being reviewed by an administrator. You will gain access once approved.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Pending Admin Approval</p>
                <p className="text-xs text-amber-600 mt-1">Documents and profile are being verified. Usually takes 1–2 business days.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-left">
            {[
              { label: 'Name', value: user.user_metadata?.name },
              { label: 'Officer Type', value: officer.officer_type || '—' },
              { label: 'Department', value: officer.department },
              { label: 'Designation', value: officer.designation },
              { label: 'City', value: officer.city || '—' },
              { label: 'Applied on', value: new Date(officer.created_at).toLocaleDateString('en-IN') },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                <p className="text-slate-700 font-semibold mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Fetch complaints — show all, or filtered by city if officer has a city
  let query = supabase
    .from('complaints')
    .select(`
      *,
      category:category_ref (category_name),
      location:location_ref (area, city, pincode),
      reporter:created_by (name, email)
    `)
    .order('created_at', { ascending: false })

  // Filter by city if officer has a city set
  if (officer.city) {
    query = query.eq('location.city', officer.city)
  }

  if (params.status) query = query.eq('status', params.status)
  if (params.priority) query = query.eq('priority', params.priority)

  const { data: complaints, error } = await query

  if (error) {
    console.error('Officer dashboard error:', error.message)
  }

  // Also fetch complaints tagged to this officer
  const { data: taggedComplaints } = await supabase
    .from('complaints')
    .select(`
      *,
      category:category_ref (category_name),
      location:location_ref (area, city, pincode),
      reporter:created_by (name, email)
    `)
    .contains('tagged_officers', [officer.officer_id])
    .order('created_at', { ascending: false })

  const allComplaints = complaints || []
  const total = allComplaints.length
  const pending = allComplaints.filter(c => c.status === 'Pending').length
  const inProgress = allComplaints.filter(c => c.status === 'In Progress').length
  const resolved = allComplaints.filter(c => c.status === 'Resolved').length
  const highPriority = allComplaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length

  const officerColors = OFFICER_TYPE_COLORS[officer.officer_type] || OFFICER_TYPE_COLORS['Municipal Worker']
  const activeView = params.view || 'all'

  const displayComplaints = activeView === 'tagged' ? (taggedComplaints || []) : allComplaints

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary-600 shadow-lg shadow-primary-500/30">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Officer Command Center</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-sm text-slate-500">
                Welcome, <span className="font-semibold text-slate-700">{user.user_metadata?.name || 'Officer'}</span>
              </p>
              {officer.officer_type && (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${officerColors.bg} ${officerColors.text} ${officerColors.ring}`}>
                  {officer.officer_type}
                </span>
              )}
              {officer.city && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" /> {officer.city}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{officer.department} · {officer.designation}</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Link
            href="/officers"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50"
          >
            <Users className="w-4 h-4" /> Officers Directory
          </Link>
          <Link
            href="/dashboard/officer"
            className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50"
          >
            Clear Filters
          </Link>
          <div className="relative group">
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <div className="hidden group-hover:block absolute right-0 z-50 mt-1 w-52 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
              <div className="p-1">
                <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</p>
                {['Pending', 'In Progress', 'Resolved'].map(s => (
                  <Link key={s} href={`?status=${s}`} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                    {s === 'Resolved' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                     s === 'In Progress' ? <AlertCircle className="w-4 h-4 text-blue-500" /> :
                     <Clock className="w-4 h-4 text-yellow-500" />}
                    {s}
                  </Link>
                ))}
                <div className="my-1 border-t border-gray-100" />
                <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Priority</p>
                {['High', 'Medium', 'Low'].map(p => (
                  <Link key={p} href={`?priority=${p}`} className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                    {p} Priority
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: 'Total Complaints', value: total, icon: ClipboardList, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600' },
          { label: 'Pending', value: pending, icon: Clock, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' },
          { label: 'In Progress', value: inProgress, icon: TrendingUp, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Resolved', value: resolved, icon: CheckCircle, color: 'green', bg: 'bg-green-50', text: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.text}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* High Priority Alert */}
      {highPriority > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-5 py-4">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-semibold text-red-800">
            {highPriority} high-priority complaint{highPriority > 1 ? 's' : ''} need immediate attention!
          </p>
          <Link href="?priority=High" className="ml-auto text-xs font-semibold text-red-700 hover:text-red-900 underline">View</Link>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
        <Link
          href="?view=all"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          All Complaints ({total})
        </Link>
        <Link
          href="?view=tagged"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'tagged' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Tag className="w-3.5 h-3.5" /> Tagged to Me ({taggedComplaints?.length || 0})
        </Link>
      </div>

      {/* Complaints Table */}
      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ticket</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Reporter</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-3 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</th>
              <th className="relative py-3.5 pl-3 pr-6"><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {displayComplaints.map(comp => (
              <tr key={comp.complaint_id} className="hover:bg-slate-50/60 transition-colors group">
                <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                  <div className="font-mono font-semibold text-slate-700">{comp.complaint_id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{new Date(comp.created_at).toLocaleDateString('en-IN')}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600 capitalize">
                  {(comp.category as { category_name: string })?.category_name?.replace(/_/g, ' ')}
                </td>
                <td className="px-3 py-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[140px]">
                      {(comp.location as { area: string; city: string })?.area}, {(comp.location as { area: string; city: string })?.city}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                  {(comp.reporter as { name: string })?.name || '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                    comp.status === 'Resolved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                    comp.status === 'In Progress' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                    'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                  }`}>
                    {comp.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                    comp.priority === 'High' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                    comp.priority === 'Medium' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                    'bg-slate-50 text-slate-600 ring-slate-500/10'
                  }`}>
                    {comp.priority}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                  <Link
                    href={`/complaints/${comp.complaint_id}`}
                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className="w-3.5 h-3.5" /> Review
                  </Link>
                </td>
              </tr>
            ))}
            {displayComplaints.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                  {activeView === 'tagged' ? 'No complaints tagged specifically to you yet.' : 'No complaints match your filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
