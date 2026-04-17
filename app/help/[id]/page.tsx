import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, MapPin, Heart, ShieldAlert, CheckCircle, Mail, Phone, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { resolveHelpRequest } from '@/app/actions/help'

// Dynamic Server Page
export default async function HelpRequestDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>You must be signed in to view this page.</p>
      </div>
    )
  }

  // Fetch the request
  const { data: request } = await supabase
    .from('help_requests_with_location')
    .select('*')
    .eq('request_id', id)
    .single()

  if (!request) {
    notFound()
  }

  const isCreator = user.id === request.user_ref
  const isResolved = request.status === 'Resolved'
  const isExpired = new Date(request.expires_at) < new Date() && !isResolved

  // Bind the action to this specific ID for the form
  const resolveWithId = resolveHelpRequest.bind(null, id)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/help" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Help Network
      </Link>

      <div className={`rounded-[3rem] overflow-hidden border border-slate-200 shadow-xl ${
          isResolved ? 'bg-emerald-50' : isExpired ? 'bg-slate-50' : 'bg-white'
      }`}>
        <div className="p-8 md:p-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                  isResolved ? 'bg-emerald-100 text-emerald-700' :
                  isExpired ? 'bg-slate-200 text-slate-600' :
                  request.urgency === 'Emergency' ? 'bg-red-100 text-red-700' :
                  request.urgency === 'High' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {isResolved ? 'Resolved' : isExpired ? 'Expired' : `${request.urgency} Urgency`}
                </span>
                
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" /> 
                  {!isResolved && !isExpired && `Expires in ${formatDistanceToNow(new Date(request.expires_at))}`}
                  {isResolved && `Resolved`}
                  {isExpired && `Expired`}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {request.title}
              </h1>
            </div>

            {/* Requester Identity Badge */}
            <div className="shrink-0 flex items-center gap-3 bg-white p-2.5 pr-5 rounded-2xl shadow-sm border border-slate-100">
               <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                 {request.creator_name[0]}
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requested By</p>
                  <p className="font-bold text-slate-900">{request.creator_name}</p>
                  <p className="text-xs text-rose-600 font-black">{request.creator_reputation} Rep Points</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
             <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
               <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                 <MapPin className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Precise Location</p>
                  <p className="font-semibold text-slate-900">{request.area}</p>
                  <p className="text-sm text-slate-500">{request.city}, {request.pincode}</p>
               </div>
             </div>

             <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-4">
               <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                 <ShieldAlert className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issue Category</p>
                  <p className="font-semibold text-slate-900">{request.category}</p>
               </div>
             </div>
          </div>

          <div className="prose prose-slate max-w-none mb-12">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-4">Situation Details</h3>
            <p className="text-lg leading-relaxed text-slate-600 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              {request.description}
            </p>
          </div>

          {/* Call to Action Area */}
          <div className="border-t border-slate-200 pt-8 mt-4">
            
            {isCreator ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
                <Heart className="w-12 h-12 text-rose-200 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-2">Did your neighbors help?</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                  If your request has been fulfilled, please mark it as resolved so others know you are safe.
                </p>
                {!isResolved ? (
                  <form action={resolveWithId}>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-xl hover:bg-emerald-600 transition-all active:scale-95">
                      <CheckCircle className="w-5 h-5" /> Mark as Resolved
                    </button>
                  </form>
                ) : (
                   <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 text-emerald-700 px-8 py-4 text-sm font-black">
                     <CheckCircle className="w-5 h-5" /> Successfully Resolved
                   </div>
                )}
              </div>
            ) : (
              <div className={`p-8 rounded-3xl border text-center shadow-sm ${
                isResolved || isExpired ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                {!isResolved && !isExpired ? (
                  <>
                    <h3 className="text-2xl font-black text-white mb-2">Ready to assist?</h3>
                    <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
                      Reach out directly to {request.creator_name} using their preferred contact method.
                    </p>
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/10 p-2 rounded-2xl border border-white/10 backdrop-blur-sm">
                       <span className="px-6 py-3 text-white font-bold flex items-center gap-2">
                         {request.contact_preference.includes('@') ? <Mail className="w-5 h-5 opacity-50"/> : <Phone className="w-5 h-5 opacity-50"/>}
                         Contact Details:
                       </span>
                       <span className="bg-rose-500 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-rose-500/20 text-lg">
                         {request.contact_preference}
                       </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-800 mb-2">Request Closed</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                      This request has either been resolved or expired. Thank you for looking out for your community!
                    </p>
                  </>
                )}
              </div>
            )}
            
          </div>

        </div>
      </div>
    </div>
  )
}
