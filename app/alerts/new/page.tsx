'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Zap, Info, MapPin, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { broadcastAlert } from '@/app/actions/alerts'
import { createClient } from '@/utils/supabase/client'
import { CITIES } from '@/utils/constants'

export default function BroadcastAlertPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('users').select('role').eq('user_id', user.id).single()
        if (profile?.role === 'officer' || profile?.role === 'admin') {
          setIsAdmin(true)
        }
      }
    }
    checkRole()
  }, [])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const res = await broadcastAlert(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Alert broadcasted successfully!')
      router.push('/alerts')
      router.refresh()
    }
  }

  if (!isAdmin && process.env.NODE_ENV === 'production') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
         <Zap className="w-16 h-16 text-slate-200 mx-auto mb-6" />
         <h1 className="text-2xl font-black text-slate-900">Unauthorized</h1>
         <p className="text-slate-500 mt-2">Only authorized officers can broadcast community alerts.</p>
         <Link href="/alerts" className="text-primary-600 font-bold mt-4 inline-block hover:underline">Back to Alerts</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/alerts" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Alerts
      </Link>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-900/5 border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-10 py-16 relative overflow-hidden">
          <div className="relative z-10 text-white">
            <h1 className="text-5xl font-black tracking-tight flex items-center gap-4">
              <Zap className="w-12 h-12 text-primary-400 fill-primary-400" /> New Broadcast
            </h1>
            <p className="text-slate-400 mt-3 text-lg max-w-xl font-medium">
              Push critical information to every resident in a specific city. Use responsibly for traffic, water, or safety updates.
            </p>
          </div>
          <Zap className="absolute -bottom-16 -right-16 w-80 h-80 text-white opacity-5 rotate-12" />
        </div>

        <form action={handleSubmit} className="p-12 space-y-10">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label htmlFor="title" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Alert Headline</label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    placeholder="e.g., Scheduled Water Cut"
                    className="block w-full rounded-2xl border-slate-200 px-6 py-4 text-slate-900 shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black"
                  />
               </div>
               <div>
                  <label htmlFor="level" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Alert Severity</label>
                  <select
                    name="level"
                    id="level"
                    required
                    className="block w-full rounded-2xl border-slate-200 px-6 py-4 text-slate-900 shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black"
                  >
                    <option value="Info">Low (Information Only)</option>
                    <option value="Warning">Medium (Take Precaution)</option>
                    <option value="Emergency">⚠️ High (Emergency Action)</option>
                  </select>
               </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Alert Content</label>
              <textarea
                name="content"
                id="content"
                rows={4}
                required
                placeholder="Keep it concise and actionable. What should residents do?"
                className="block w-full rounded-3xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:text-slate-300 leading-relaxed font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label htmlFor="city" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Target City</label>
                  <select
                    name="city"
                    id="city"
                    required
                    className="block w-full rounded-2xl border-slate-200 px-6 py-4 text-slate-900 shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black"
                  >
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
               </div>
               <div>
                  <label htmlFor="hours" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Duration (Hours)</label>
                  <input
                    type="number"
                    name="hours"
                    id="hours"
                    required
                    defaultValue={24}
                    min={1}
                    max={168}
                    className="block w-full rounded-2xl border-slate-200 px-6 py-4 text-slate-900 shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black"
                  />
               </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-primary-600 bg-primary-50 px-5 py-3 rounded-2xl border border-primary-100">
               <Info className="w-5 h-5 shrink-0" />
               <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                  Broadcasts appear at the top of real-time feeds
               </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-12 py-5 text-sm font-black text-white shadow-2xl shadow-slate-900/40 hover:bg-primary-600 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
            >
              Broadcast Now {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
