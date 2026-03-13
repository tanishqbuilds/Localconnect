import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react'

export default async function CitizenDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: complaints, error } = await supabase
    .from('complaints')
    .select(`
      *,
      category:category_ref (category_name),
      location:location_ref (area, city)
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
  }

  const pending = complaints?.filter(c => c.status === 'Pending').length || 0
  const inProgress = complaints?.filter(c => c.status === 'In Progress').length || 0
  const resolved = complaints?.filter(c => c.status === 'Resolved').length || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
            My Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user.user_metadata?.name || 'Citizen'}. Here's an overview of your reported issues.
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <Link
            href="/create-complaint"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
          >
            <PlusCircle className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Report Issue
          </Link>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100 border-l-4 border-l-yellow-400">
          <dt className="truncate text-sm font-medium text-slate-500 flex items-center gap-2">
             <Clock className="w-4 h-4 text-yellow-500" /> Pending Issues
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{pending}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100 border-l-4 border-l-blue-400">
          <dt className="truncate text-sm font-medium text-slate-500 flex items-center gap-2">
             <AlertCircle className="w-4 h-4 text-blue-500" /> In Progress
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{inProgress}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100 border-l-4 border-l-green-400">
          <dt className="truncate text-sm font-medium text-slate-500 flex items-center gap-2">
             <CheckCircle className="w-4 h-4 text-green-500" /> Resolved
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{resolved}</dd>
        </div>
      </dl>

      <div className="bg-white shadow rounded-lg border border-gray-100">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-400" />
          <h3 className="text-base font-semibold leading-6 text-slate-900">Recent Complaints</h3>
        </div>
        <ul role="list" className="divide-y divide-gray-100">
          {complaints?.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">
              No reports filed yet. Start by reporting an issue in your locality.
            </li>
          ) : (
            complaints?.map((complaint) => (
            <li key={complaint.complaint_id} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-slate-50 transition-colors sm:px-6">
              <div className="flex min-w-0 gap-x-4 items-center">
                <div className={`mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full ${
                  complaint.status === 'Resolved' ? 'bg-green-100' :
                  complaint.status === 'In Progress' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  {complaint.status === 'Resolved' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                   complaint.status === 'In Progress' ? <AlertCircle className="h-5 w-5 text-blue-600" /> :
                   <Clock className="h-5 w-5 text-yellow-600" />}
                </div>
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-slate-900">
                    <Link href={`/complaints/${complaint.complaint_id}`}>
                      <span className="absolute inset-x-0 -top-px bottom-0" />
                      {complaint.category?.category_name?.charAt(0).toUpperCase() + complaint.category?.category_name?.slice(1)} Issue
                    </Link>
                  </p>
                  <p className="mt-1 flex text-xs leading-5 text-slate-500 truncate max-w-sm">
                    {complaint.description}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-x-4">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm leading-6 text-slate-900">{complaint.location?.area}, {complaint.location?.city}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Reported on <time dateTime={complaint.created_at}>{new Date(complaint.created_at).toLocaleDateString()}</time>
                  </p>
                </div>
              </div>
            </li>
          )))}
        </ul>
      </div>
    </div>
  )
}
