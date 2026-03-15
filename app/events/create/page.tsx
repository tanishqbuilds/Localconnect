'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Calendar, Clock, MapPin, Tag, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { createEvent } from '@/app/actions/events'
import LocationPicker, { LocationData } from '@/components/LocationPicker'
import { EVENT_CATEGORIES } from '@/utils/constants'

export default function HostEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)

  async function handleSubmit(formData: FormData) {
    if (!location) {
      toast.error('Please set event location.')
      return
    }

    setLoading(true)
    const res = await createEvent(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Event scheduled successfully!')
      router.push('/events')
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/events" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Local Events
      </Link>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-amber-500/5 border border-slate-200 overflow-hidden">
        <div className="bg-amber-600 px-10 py-16 relative overflow-hidden">
          <div className="relative z-10 text-white">
            <h1 className="text-5xl font-black tracking-tight flex items-center gap-4">
              <Sparkles className="w-12 h-12" /> Host an Event
            </h1>
            <p className="text-amber-100 mt-3 text-lg max-w-xl font-medium">
              Create a gathering that brings the community together. Cleanup drives, festivals, or local workshops.
            </p>
          </div>
          <Calendar className="absolute -bottom-16 -right-16 w-80 h-80 text-white opacity-10 rotate-12" />
        </div>

        <form action={handleSubmit} className="p-12 space-y-12">
          {/* Section 1: Visibility & Location */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-1">
                <h3 className="text-xl font-black text-slate-900 mb-2">Event Scope</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                   Events are visible only to residents of the chosen city and area.
                </p>
             </div>
             <div className="lg:col-span-2">
                <LocationPicker onLocationSet={setLocation} currentLocation={location} />
             </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Section 2: Core Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-1">
                <h3 className="text-xl font-black text-slate-900 mb-2">Primary Info</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                   Choose a catchy title and the right category to attract participants.
                </p>
             </div>
             <div className="lg:col-span-2 space-y-8">
                <div>
                   <label htmlFor="title" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Event Title</label>
                   <input
                     type="text"
                     name="title"
                     id="title"
                     required
                     placeholder="e.g., Annual Sector-7 Beach Cleanup"
                     className="block w-full rounded-2xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-black text-lg placeholder:font-normal placeholder:text-slate-300"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div>
                      <label htmlFor="category" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Event Category</label>
                      <select
                        name="category"
                        id="category"
                        required
                        className="block w-full rounded-2xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-black"
                      >
                        {EVENT_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.label}>{cat.label}</option>
                        ))}
                      </select>
                   </div>
                   <div>
                      <label htmlFor="date" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Date & Time</label>
                      <input
                        type="datetime-local"
                        name="date"
                        id="date"
                        required
                        className="block w-full rounded-2xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-black"
                      />
                   </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Narrative / Agenda</label>
                  <textarea
                    name="description"
                    id="description"
                    rows={6}
                    required
                    placeholder="Tell your neighbors what to expect. What should they bring? What is the goal?"
                    className="block w-full rounded-3xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all placeholder:text-slate-300 leading-relaxed font-medium"
                  />
                </div>
             </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 px-5 py-3 rounded-2xl border border-amber-100">
               <Tag className="w-5 h-5 shrink-0" />
               <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Host gets 100 reputation points on completion
               </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-12 py-5 text-sm font-black text-white shadow-2xl shadow-slate-900/30 hover:bg-amber-600 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
            >
              Broadcast Event {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
