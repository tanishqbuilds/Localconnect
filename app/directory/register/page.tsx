'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Store, Briefcase, MapPin, Tag, Globe, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { registerBusiness } from '@/app/actions/businesses'
import LocationPicker, { LocationData } from '@/components/LocationPicker'
import { BUSINESS_CATEGORIES } from '@/utils/constants'

export default function RegisterBusinessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)

  async function handleSubmit(formData: FormData) {
    if (!location) {
      toast.error('Please set business location.')
      return
    }

    setLoading(true)
    const res = await registerBusiness(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Business successfully listed in community directory!')
      router.push('/directory')
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/directory" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
      </Link>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-500/5 border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 px-10 py-16 relative overflow-hidden">
          <div className="relative z-10 text-white">
            <h1 className="text-5xl font-black tracking-tight flex items-center gap-4">
              <Store className="w-12 h-12" /> List Business
            </h1>
            <p className="text-indigo-100 mt-3 text-lg max-w-xl font-medium">
              Join the LocalConnect community network. Get verified and discovered by residents in your exact locality.
            </p>
          </div>
          <Briefcase className="absolute -bottom-16 -right-16 w-80 h-80 text-white opacity-10 rotate-12" />
        </div>

        <form action={handleSubmit} className="p-12 space-y-12">
          {/* Section 1: Business Identity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-1">
                <h3 className="text-xl font-black text-slate-900 mb-2">Business Profile</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                   Enter your public business identity as it should appear in search results.
                </p>
             </div>
             <div className="lg:col-span-2 space-y-8">
                <div>
                   <label htmlFor="name" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Business Name</label>
                   <input
                     type="text"
                     name="name"
                     id="name"
                     required
                     placeholder="e.g., QuickFix Plumbing Solutions"
                     className="block w-full rounded-2xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-lg placeholder:font-normal placeholder:text-slate-300"
                   />
                </div>

                <div>
                   <label htmlFor="category" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Service Category</label>
                   <select
                     name="category"
                     id="category"
                     required
                     className="block w-full rounded-2xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black"
                   >
                     {BUSINESS_CATEGORIES.map(cat => (
                       <option key={cat.value} value={cat.label}>{cat.label}</option>
                     ))}
                   </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">About / Services Offered</label>
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    required
                    placeholder="Briefly describe your services, years of experience, and specialization."
                    className="block w-full rounded-3xl border-slate-200 px-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 leading-relaxed font-medium"
                  />
                </div>
             </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Section 2: Precise Location */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-1">
                <h3 className="text-xl font-black text-slate-900 mb-2">Operating Zone</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                   Pin your physical shop location or your primary service area base.
                </p>
             </div>
             <div className="lg:col-span-2">
                <LocationPicker onLocationSet={setLocation} currentLocation={location} />
             </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Section 3: Contact Channels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-1">
                <h3 className="text-xl font-black text-slate-900 mb-2">Contact Channels</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                   How should customers reach you? Verification increases trust.
                </p>
             </div>
             <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Primary Contact No."
                        required
                        className="block w-full rounded-2xl border-slate-200 pl-14 pr-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                      />
                   </div>
                   <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Business Email"
                        className="block w-full rounded-2xl border-slate-200 pl-14 pr-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                      />
                   </div>
                </div>
                <div className="relative">
                   <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input
                     type="url"
                     name="website"
                     placeholder="Website URL (Optional)"
                     className="block w-full rounded-2xl border-slate-200 pl-14 pr-6 py-5 text-slate-900 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                   />
                </div>
             </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex items-center justify-between gap-6">
            <p className="text-xs text-slate-400 max-w-xs font-bold uppercase tracking-tight">
               By listing, you agree to respond to community inquiries professionally.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-12 py-5 text-sm font-black text-white shadow-2xl shadow-slate-900/30 hover:bg-indigo-600 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
            >
              List Business Now {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
