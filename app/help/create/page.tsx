'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Heart, AlertCircle, Info, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { createHelpRequest } from '@/app/actions/help'
import LocationPicker, { LocationData } from '@/components/LocationPicker'
import { HELP_CATEGORIES } from '@/utils/constants'

export default function CreateHelpRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)

  async function handleSubmit(formData: FormData) {
    if (!location) {
      toast.error('Please set your location first.')
      return
    }

    setLoading(true)
    const res = await createHelpRequest(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Help request broadcasted to neighbors!')
      router.push('/help')
      router.refresh()
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/help" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Help Network
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-rose-500/5 border border-slate-200 overflow-hidden">
        <div className="bg-rose-600 px-8 py-12 relative overflow-hidden">
          <div className="relative z-10 text-white">
            <h1 className="text-4xl font-black flex items-center gap-3">
              <Heart className="w-10 h-10 fill-white" /> Request Help
            </h1>
            <p className="text-rose-100 mt-2 text-sm max-w-md">
              Need assistance? Your request will be visible to neighbors who can lend a hand. 
            </p>
          </div>
          <Heart className="absolute -bottom-12 -right-12 w-64 h-64 text-white opacity-10" />
        </div>

        <form action={handleSubmit} className="p-10 space-y-10">
          <div className="space-y-8">
            {/* Location Section */}
            <div className="space-y-4">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-[10px]">1</div>
                  Occurrence Location
               </h3>
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                  <LocationPicker onLocationSet={setLocation} currentLocation={location} />
               </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-[10px]">2</div>
                 Request Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="title" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Short Summary</label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      placeholder="e.g., Need blood donor (O+)"
                      className="block w-full rounded-2xl border-slate-200 px-4 py-4 text-slate-900 shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-bold placeholder:font-normal placeholder:text-slate-300"
                    />
                 </div>
                 <div>
                    <label htmlFor="category" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                    <select
                      name="category"
                      id="category"
                      required
                      className="block w-full rounded-2xl border-slate-200 px-4 py-4 text-slate-900 shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-bold"
                    >
                      {HELP_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.label}>{cat.label}</option>
                      ))}
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="urgency" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Urgency Level</label>
                    <select
                      name="urgency"
                      id="urgency"
                      required
                      className="block w-full rounded-2xl border-slate-200 px-4 py-4 text-slate-900 shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-bold"
                    >
                      <option value="Low">Standard / Low</option>
                      <option value="High">High / Persistent</option>
                      <option value="Emergency">⚠️ Emergency / Critical</option>
                    </select>
                 </div>
                 <div>
                    <label htmlFor="hours" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Visible For</label>
                    <select
                      name="hours"
                      id="hours"
                      required
                      className="block w-full rounded-2xl border-slate-200 px-4 py-4 text-slate-900 shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-bold"
                    >
                      <option value="6">6 Hours</option>
                      <option value="12">12 Hours</option>
                      <option value="24" selected>24 Hours (Standard)</option>
                      <option value="72">3 Days</option>
                    </select>
                 </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Description</label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  placeholder="Explain exactly what you need and any relevant details (e.g. hospital name, specific tool required)."
                  className="block w-full rounded-2xl border-slate-200 px-4 py-4 text-slate-900 shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all placeholder:text-slate-300 leading-relaxed font-medium"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-[10px]">3</div>
                 Contact Preference
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 hover:border-rose-200 cursor-pointer transition-all has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50">
                       <input type="radio" name="contact" value="Phone" required className="accent-rose-500 w-4 h-4" defaultChecked />
                       <Phone className="w-5 h-5 text-slate-400" />
                       <span className="text-sm font-bold text-slate-700">Call / WhatsApp</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-100 hover:border-rose-200 cursor-pointer transition-all has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50">
                       <input type="radio" name="contact" value="Email" required className="accent-rose-500 w-4 h-4" />
                       <Mail className="w-5 h-5 text-slate-400" />
                       <span className="text-sm font-bold text-slate-700">Email Only</span>
                    </label>
                 </div>
                 <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100">
                    <div className="flex items-start gap-3">
                       <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                       <p className="text-xs text-rose-800 leading-relaxed">
                          Your contact details from your profile will be shared only with those who offer to help.
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400 max-w-xs font-bold uppercase tracking-tight">
              A notification will be sent to nearby verified residents.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-10 py-5 text-sm font-black text-white shadow-2xl shadow-slate-900/20 hover:bg-rose-600 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
            >
              Broadcast Request {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
