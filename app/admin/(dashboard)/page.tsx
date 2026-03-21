import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, UserCheck, ClipboardList, MessageSquare, AlertTriangle, CheckCircle, Clock, TrendingUp, FileText } from 'lucide-react'
import Link from 'next/link'
import RealtimeSubscriber from '@/components/RealtimeSubscriber'

export default async function AdminDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  // Fetch all the statistics
  const [
    { count: totalCitizens },
    { count: totalOfficers },
    { count: pendingOfficers },
    { count: totalComplaints },
    { count: pendingComplaints },
    { count: inProgressComplaints },
    { count: resolvedComplaints },
    { count: totalPosts },
    { count: totalComments },
    { data: recentComplaints },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'citizen'),
    supabase.from('officers').select('*', { count: 'exact', head: true }),
    supabase.from('officers').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('complaints').select('*', { count: 'exact', head: true }),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'In Progress'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Resolved'),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('complaints').select(`
      complaint_id, description, status, priority, created_at,
      category:category_ref (category_name),
      location:location_ref (area, city),
      created_by (name, email)
    `).order('created_at', { ascending: false }).limit(5),
    supabase.from('users').select('user_id, name, email, role, created_at').order('created_at', { ascending: false }).limit(8),
  ])

  const stats = [
    { label: 'Citizens', value: totalCitizens || 0, icon: Users, color: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Officers', value: totalOfficers || 0, icon: UserCheck, color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-600', badge: pendingOfficers ? `${pendingOfficers} pending` : undefined },
    { label: 'Complaints', value: totalComplaints || 0, icon: ClipboardList, color: 'bg-amber-500', lightBg: 'bg-amber-50', textColor: 'text-amber-600' },
    { label: 'Community Posts', value: totalPosts || 0, icon: MessageSquare, color: 'bg-violet-500', lightBg: 'bg-violet-50', textColor: 'text-violet-600' },
  ]

  const complaintBreakdown = [
    { label: 'Pending', value: pendingComplaints || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-500/20' },
    { label: 'In Progress', value: inProgressComplaints || 0, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-500/20' },
    { label: 'Resolved', value: resolvedComplaints || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', ring: 'ring-green-500/20' },
  ]

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <RealtimeSubscriber tables={['complaints', 'officers', 'users', 'posts', 'comments']} />
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard Overview</h1>
        <div className="mt-1 text-sm text-slate-500">
          Welcome back, {user.user_metadata?.name || 'Admin'}. Here&apos;s what&apos;s happening on LocalConnect.
        </div>
      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="relative bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.lightBg} rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
            {stat.badge && (
              <div className="absolute top-3 right-3">
                <Link href="/admin/officers" className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors">
                  <AlertTriangle className="w-3 h-3" />
                  {stat.badge}
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Complaints Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-slate-400" />
          Complaints Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {complaintBreakdown.map((item) => (
            <div key={item.label} className={`flex items-center gap-3 p-4 rounded-lg ${item.bg} ring-1 ${item.ring}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <div>
                <p className={`text-sm font-medium ${item.color}`}>{item.label}</p>
                <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Recent Complaints
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentComplaints?.map((c: any) => (
              <li key={c.complaint_id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate capitalize">
                      {c.category?.category_name} — {c.location?.area}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{c.description}</p>
                    <p className="text-xs text-slate-400 mt-1">by {c.created_by?.name} · {new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                    c.status === 'Resolved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                    c.status === 'In Progress' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                    'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                  }`}>
                    {c.status}
                  </span>
                </div>
              </li>
            ))}
            {!recentComplaints?.length && (
              <li className="px-6 py-8 text-center text-sm text-slate-400">No complaints yet.</li>
            )}
          </ul>
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              Recent Registrations
            </h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentUsers?.map((u: any) => (
              <li key={u.user_id} className="px-6 py-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0 ${
                    u.role === 'officer' ? 'bg-emerald-500' : u.role === 'admin' ? 'bg-violet-500' : 'bg-blue-500'
                  }`}>
                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  u.role === 'officer' ? 'bg-emerald-50 text-emerald-700' :
                  u.role === 'admin' ? 'bg-violet-50 text-violet-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {u.role}
                </span>
              </li>
            ))}
            {!recentUsers?.length && (
              <li className="px-6 py-8 text-center text-sm text-slate-400">No users yet.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Stats footer */}
      <div className="mt-8 text-center text-xs text-slate-400">
        Total comments: {totalComments || 0} · Data as of {new Date().toLocaleDateString()}
      </div>
    </div>
  )
}
