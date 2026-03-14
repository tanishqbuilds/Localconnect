import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Filter, Users, MapPin, ClipboardList, Clock, ShieldAlert } from 'lucide-react'

export default async function OfficerDashboard({
  searchParams,
}: {
  searchParams: { status?: string, priority?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: officer } = await supabase.from('officers').select('*').eq('user_id', user.id).single()

  // If officer is not approved, show pending approval message
  if (officer && !officer.is_approved) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Registration Under Review</h1>
          <p className="text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
            Your officer registration is currently being reviewed by an administrator.
            You will be able to access the Officer Command Center once your account has been approved.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Pending Admin Approval</p>
                <p className="text-xs text-amber-600 mt-1">
                  Your submitted documents and profile details are being verified. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-400">
            <p><strong className="text-slate-600">Name:</strong> {user.user_metadata?.name}</p>
            <p><strong className="text-slate-600">Department:</strong> {officer.department}</p>
            <p><strong className="text-slate-600">Designation:</strong> {officer.designation}</p>
            <p><strong className="text-slate-600">Applied on:</strong> {new Date(officer.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    )
  }

  let query = supabase
    .from('complaints')
    .select(`
      *,
      category:category_ref (category_name),
      location:location_ref (area, city, pincode),
      created_by (name, email)
    `)
    .order('created_at', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.priority) query = query.eq('priority', searchParams.priority)

  const { data: complaints, error } = await query

  if (error) {
    console.error('Officer dashboard complaints query error:', error.message)
  }
  if (!officer) {
    console.error('No officer record found for user:', user.id, '- complaints will not be visible due to RLS')
  }

  const total = complaints?.length || 0
  const pending = complaints?.filter(c => c.status === 'Pending').length || 0
  const inProgress = complaints?.filter(c => c.status === 'In Progress').length || 0


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Officer Command Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome, {user.user_metadata?.name || 'Officer'}. Department: {officer?.department || 'General'}
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0 flex gap-2">
          <Link href="/dashboard/officer" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            Clear Filters
          </Link>
          <div className="relative inline-block text-left group">
            <button className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">
              <Filter className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
              Filter Status
            </button>
            <div className="hidden group-hover:block absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Link href="?status=Pending" className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100">Pending</Link>
                <Link href="?status=In Progress" className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100">In Progress</Link>
                <Link href="?status=Resolved" className="text-slate-700 block px-4 py-2 text-sm hover:bg-slate-100">Resolved</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Active Views</p>
            <p className="text-2xl font-semibold text-slate-900">{total}</p>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Actions</p>
            <p className="text-2xl font-semibold text-slate-900">{pending}</p>
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">In Progress Works</p>
            <p className="text-2xl font-semibold text-slate-900">{inProgress}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-300">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Ticket</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Category</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Location</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Priority</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {complaints?.map((comp) => (
              <tr key={comp.complaint_id} className="hover:bg-slate-50 transition-colors">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                  {comp.complaint_id.slice(0, 8).toUpperCase()}
                  <div className="text-xs text-slate-500 font-normal">{new Date(comp.created_at).toLocaleDateString()}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 capitalize">{comp.category?.category_name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {comp.location?.area}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${comp.status === 'Resolved' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      comp.status === 'In Progress' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                        'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                    }`}>
                    {comp.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${comp.priority === 'High' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                      comp.priority === 'Medium' ? 'bg-orange-50 text-orange-700 ring-orange-600/10' :
                        'bg-slate-50 text-slate-600 ring-slate-500/10'
                    }`}>
                    {comp.priority}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <Link href={`/complaints/${comp.complaint_id}`} className="text-primary-600 hover:text-primary-900">
                    Review<span className="sr-only">, {comp.complaint_id}</span>
                  </Link>
                </td>
              </tr>
            ))}
            {complaints?.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-slate-500">No complaints match your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
