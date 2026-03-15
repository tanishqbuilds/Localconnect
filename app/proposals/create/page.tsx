import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Sparkles, MapPin, Tag, Clock } from 'lucide-react'
import { createProposal } from '@/app/actions/proposals'
import { PROPOSAL_CATEGORIES } from '@/utils/constants'

export default async function CreateProposalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user profile for location default
  const { data: profile } = await supabase
    .from('users')
    .select('city')
    .eq('user_id', user.id)
    .single()

  const userCity = profile?.city

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/proposals" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Proposals
      </Link>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-8 py-10 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary-400" /> Start a Proposal
            </h1>
            <p className="text-slate-400 mt-2 text-sm max-w-md">
              Draft a initiative to improve your community. Your neighbors will vote on it, and approved plans move to municipal review.
            </p>
          </div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-600/20 blur-3xl" />
        </div>

        <form action={async (formData) => { await createProposal(formData); }} className="p-8 space-y-8">
          <input type="hidden" name="city" value={userCity || ''} />

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-slate-900 mb-2">Proposal Title</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                placeholder="e.g., Installation of CCTV at Sector 4 Park"
                className="block w-full rounded-2xl border-slate-200 px-4 py-4 text-slate-900 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" /> Category
                </label>
                <select
                  name="category"
                  id="category"
                  required
                  className="block w-full rounded-2xl border-slate-200 px-4 py-4 text-slate-900 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                >
                  {PROPOSAL_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.label}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" /> Voting Duration
                </label>
                <select
                  name="duration"
                  id="duration"
                  required
                  className="block w-full rounded-2xl border-slate-200 px-4 py-4 text-slate-900 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium"
                >
                  <option value="7">7 Days (Urgent)</option>
                  <option value="15">15 Days</option>
                  <option value="30" selected>30 Days (Standard)</option>
                  <option value="60">60 Days (Major Project)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Target Locality
              </label>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {userCity || 'Location not set in profile'}
                <span className="ml-auto text-[10px] text-slate-400 font-bold uppercase tracking-wider">Default from Profile</span>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-slate-900 mb-2">Description & Goals</label>
              <textarea
                name="description"
                id="description"
                rows={6}
                required
                placeholder="Explain the problem and how this proposal solves it. Be specific about the location and expected benefits."
                className="block w-full rounded-2xl border-slate-200 px-4 py-4 text-slate-900 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-slate-400 leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-400 max-w-xs">
              By submitting, you agree that your proposal will be visible to all residents in your city.
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-primary-500/30 hover:bg-primary-500 hover:-translate-y-1 active:translate-y-0 transition-all"
            >
              Submit Proposal <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
