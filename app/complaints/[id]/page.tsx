import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, Tag, AlertCircle, ArrowLeft, Send } from 'lucide-react'
import { updateComplaintStatus } from '@/app/actions/complaints'
import toast from 'react-hot-toast'
import ClientFormRenderer from './ClientFormRenderer'

export default async function ComplaintDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('user_id', user.id).single()
  const role = userData?.role || 'citizen'

  const { data: complaint, error } = await supabase
    .from('complaints')
    .select(`
      *,
      category:category_ref (category_name),
      location:location_ref (area, city, pincode),
      created_by (name, email),
      assigned_officer (department, designation)
    `)
    .eq('complaint_id', id)
    .single()

  if (error || !complaint) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Complaint not found</h2>
        <Link href={`/dashboard/${role}`} className="mt-4 text-primary-600 hover:text-primary-500">
           Return to Dashboard
        </Link>
      </div>
    )
  }

  const { data: updates } = await supabase
    .from('status_updates')
    .select(`
       *,
       updated_by (department, designation, user_id)
    `)
    .eq('complaint_ref', id)
    .order('update_date', { ascending: true })

  // Check if we are officers
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <Link href={`/dashboard/${role}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
       </Link>

       <div className="bg-white shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center flex-wrap gap-4 border-b border-gray-100">
             <div>
                <h3 className="text-base font-semibold leading-6 text-slate-900 capitalize flex items-center gap-2">
                   {complaint.category.category_name} Issue
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">Report ID: {complaint.complaint_id}</p>
             </div>
             <div className="flex gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                     complaint.priority === 'High' ? 'bg-red-100 text-red-800' :
                     complaint.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                     'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.priority} Priority
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                     complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                     complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                     'bg-yellow-100 text-yellow-800'
                  }`}>
                    {complaint.status}
                </span>
             </div>
          </div>
          <div className="border-t border-slate-100 px-4 py-5 sm:p-0">
             <dl className="sm:divide-y sm:divide-slate-100">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                   <dt className="text-sm font-medium text-slate-500 flex items-center gap-2"><MapPin className="w-4 h-4"/> Location</dt>
                   <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">{complaint.location.area}, {complaint.location.city} - {complaint.location.pincode}</dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                   <dt className="text-sm font-medium text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Reported On</dt>
                   <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">{new Date(complaint.created_at).toLocaleString()}</dd>
                </div>
                 <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                   <dt className="text-sm font-medium text-slate-500">Reported By</dt>
                   <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">{complaint.created_by.name}</dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                   <dt className="text-sm font-medium text-slate-500 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Description</dt>
                   <dd className="mt-1 text-sm leading-6 text-slate-900 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">
                      {complaint.description}
                   </dd>
                </div>
                {complaint.image_url && (
                   <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                     <dt className="text-sm font-medium text-slate-500">Supporting Attachment</dt>
                     <dd className="mt-2 text-sm text-slate-900 sm:col-span-2 sm:mt-0">
                        <div className="relative h-64 w-full md:w-2/3 mt-2 rounded-lg overflow-hidden border border-slate-200">
                           <Image src={complaint.image_url} alt="Complaint Image" fill className="object-cover" />
                        </div>
                     </dd>
                   </div>
                )}
             </dl>
          </div>
       </div>

       {/* Timeline and Officer Actions */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Status Timeline</h3>
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                 <li key="created">
                    <div className="relative pb-8">
                       <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                       <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center ring-8 ring-white">
                               <Calendar className="h-4 w-4" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                               <p className="text-sm text-slate-500">Complaint logged by <span className="font-medium text-slate-900">{complaint.created_by.name}</span></p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-slate-500">
                              <time dateTime={complaint.created_at}>{new Date(complaint.created_at).toLocaleDateString()}</time>
                            </div>
                          </div>
                       </div>
                    </div>
                 </li>
                 {updates?.map((update, idx) => (
                    <li key={update.update_id}>
                      <div className="relative pb-8">
                         {idx !== updates.length - 1 ? (
                           <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                         ) : null}
                         <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center ring-8 ring-white">
                                 <AlertCircle className="h-4 w-4" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                 <p className="text-sm text-slate-500">
                                   Update from <span className="font-medium text-slate-900">{update.updated_by.department} {update.updated_by.designation}</span>
                                 </p>
                                 <p className="mt-1 text-sm text-slate-900">{update.update_text}</p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-slate-500">
                                <time dateTime={update.update_date}>{new Date(update.update_date).toLocaleDateString()}</time>
                              </div>
                            </div>
                         </div>
                      </div>
                    </li>
                 ))}
                 {complaint.status === 'Resolved' && (
                    <li key="resolved">
                      <div className="relative pb-8">
                         <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center ring-8 ring-white">
                                 <Tag className="h-4 w-4" />
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                 <p className="text-sm font-medium text-green-600">Complaint Marked as Resolved</p>
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-slate-500">
                                <time dateTime={complaint.updated_at}>{new Date(complaint.updated_at).toLocaleDateString()}</time>
                              </div>
                            </div>
                         </div>
                      </div>
                    </li>
                 )}
              </ul>
            </div>
          </div>

          {role === 'officer' && complaint.status !== 'Resolved' && (
             <div>
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 shadow-sm">
                   <h3 className="text-lg font-bold text-slate-900 mb-4">Officer Actions</h3>
                   <ClientFormRenderer action={updateComplaintStatus} complaint_id={complaint.complaint_id} currentStatus={complaint.status} />
                </div>
             </div>
          )}
       </div>
    </div>
  )
}
