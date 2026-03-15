import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PlusCircle, Vote, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function ProposalsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: proposals } = await supabase
    .from('proposals')
    .select(`
      *,
      creator:created_by (name),
      votes:proposal_votes (vote_type)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Civic Proposals</h1>
          <p className="text-slate-500 mt-1">Vote on initiatives to improve your neighborhood.</p>
        </div>
        <Link
          href="/proposals/create"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> New Proposal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals?.map((proposal) => {
          const yesVotes = proposal.votes.filter((v: any) => v.vote_type).length
          const noVotes = proposal.votes.filter((v: any) => !v.vote_type).length
          const totalVotes = yesVotes + noVotes
          const approvalRate = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0
          
          return (
            <div key={proposal.proposal_id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                    {proposal.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(proposal.expires_at))} left
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                  <Link href={`/proposals/${proposal.proposal_id}`} className="hover:text-primary-600 transition-colors">
                    {proposal.title}
                  </Link>
                </h3>
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                  {proposal.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500">Progress to Approval</span>
                    <span className={approvalRate >= 60 ? 'text-green-600' : 'text-slate-900'}>
                      {approvalRate.toFixed(1)}% Yes
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${approvalRate >= 60 ? 'bg-green-500' : 'bg-primary-500'}`}
                      style={{ width: `${approvalRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                    <span>{yesVotes} Yes</span>
                    <span>{noVotes} No</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  By <span className="font-semibold text-slate-700">{(proposal.creator as any)?.name}</span>
                </div>
                <Link 
                  href={`/proposals/${proposal.proposal_id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700"
                >
                  <Vote className="w-4 h-4" /> View & Vote
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {(!proposals || proposals.length === 0) && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Vote className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No proposals found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
            Be the first to propose an improvement in your locality.
          </p>
          <Link
            href="/proposals/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Start a Proposal
          </Link>
        </div>
      )}
    </div>
  )
}
