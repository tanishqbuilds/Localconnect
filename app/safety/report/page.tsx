'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, ShieldAlert, AlertTriangle, MapPin, Tag, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { reportSafetyConcern } from '@/app/actions/safety'
import LocationPicker, { LocationData } from '@/components/LocationPicker'

const SAFETY_CATEGORIES = [
  'Broken Streetlight',
  'Pothole / Road Hazard',
  'Open Manhole',
  'Exposed Wires',
  'Structural Damage',
  'Gas Leak / Smell',
  'Public Nuisance',
  'Hazardous Obstruction'
]

export default function ReportSafetyConcernPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)

  async function handleSubmit(formData: FormData) {
    if (!location) {
      toast.error('Please pinpoint the hazard location.')
      return
    }

    setLoading(true)
    const res = await reportSafetyConcern(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Safety concern reported to authorities!')
      router.push('/safety')
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/safety" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Public Safety
      </Link>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-orange-500/5 border border-slate-200 overflow-hidden">
        <div className="bg-orange-600 px-10 py-16 relative overflow-hidden">
          <div className="relative z-10 text-white">
            <h1 className="text-5xl font-black tracking-tight flex items-center gap-4">
              <ShieldAlert className="w-12 h-12" /> Report Hazard
            </h1>
            <p className="text-orange-100 mt-3 text-lg max-w-xl font-medium">
              Spot something dangerous? Report it immediately to ensure the safety of your neighbors and faster repair.
            </p>
          </div>
          <AlertTriangle className="absolute -bottom-16 -right-16 w-80 h-80 text-white opacity-10 -rotate-12" />
        </div>

        <form action={handleSubmit} className="p-12 space-y-12">
          {/* Section 1: Location & Mapping */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-1">
                <h3 className="text-xl font-black text-slate-900 mb-2">Pinpoint Hazard</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                   Accurate location helps emergency crews find and fix the issue faster.
                </p>
             </div>
             <div className="lg:col-span-2">
                <LocationPicker onLocationSet={setLocation} currentLocation={location} />
             </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Section 2: Concern Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-1">
                <h3 className="text-xl font-black text-slate-900 mb-2">Report Content</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                   Describe the severity and type of danger clearly.
                </p>
             </div>
             <div className="lg:col-span-2 space-y-8">
                <div>
                   <label htmlFor="title" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Incident Title</label>
                   <input
                     type="text"
                     name="title"
                     id="title"
                     required
                     placeholder="e.g., Massive Pothole near Sector 5 Exit"
                     className="block w-full rounded-2xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-black text-lg placeholder:font-normal placeholder:text-slate-300"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label htmlFor="category" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Hazard Category</label>
                      <select
                        name="category"
                        id="category"
                        required
                        className="block w-full rounded-2xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-black"
                      >
                        {SAFETY_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                   </div>
                   <div>
                      <label htmlFor="severity" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Severity Level</label>
                      <select
                        name="severity"
                        id="severity"
                        required
                        className="block w-full rounded-2xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-black"
                      >
                        <option value="Low">Low (Requires Attention)</option>
                        <option value="Medium" selected>Medium (Safety Risk)</option>
                        <option value="High">High (Immediate Danger)</option>
                        <option value="Critical">⚠️ Critical (Life Threatening)</option>
                      </select>
                   </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Visual/Contextual Details</label>
                  <textarea
                    name="description"
                    id="description"
                    rows={6}
                    required
                    placeholder="Provide specific details. Is it blocking traffic? Is there water leakage? Any landmarks nearby?"
                    className="block w-full rounded-3xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-300 leading-relaxed font-medium"
                  />
                </div>
             </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-orange-600 bg-orange-50 px-5 py-3 rounded-2xl border border-orange-100">
               <Info className="w-5 h-5 shrink-0" />
               <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Authorities in {location?.city || 'Your Area'} will be alerted
               </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-12 py-5 text-sm font-black text-white shadow-2xl shadow-slate-900/30 hover:bg-orange-600 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
            >
              Submit Report {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
