import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, MapPin, Calendar, Vote, ThumbsUp, ThumbsDown, Info, ShieldCheck } from 'lucide-react'
import { format } from 'date-fns'
import { castVote } from '@/app/actions/proposals'

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: proposal } = await supabase
    .from('proposals')
    .select(`
      *,
      creator:created_by (name, reputation_score),
      votes:proposal_votes (user_ref, vote_type)
    `)
    .eq('proposal_id', params.id)
    .single()

  if (!proposal) notFound()

  const userVote = proposal.votes.find((v: any) => v.user_ref === user.id)
  const yesVotes = proposal.votes.filter((v: any) => v.vote_type).length
  const noVotes = proposal.votes.filter((v: any) => !v.vote_type).length
  const totalVotes = yesVotes + noVotes
  const approvalRate = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0
  const isApproved = approvalRate >= 60 && totalVotes >= proposal.min_participation_threshold

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/proposals" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Proposals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 border border-primary-100 uppercase tracking-wider">
                {proposal.category}
              </span>
              {isApproved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700 border border-green-100 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Approved by Community
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-4">{proposal.title}</h1>
            
            <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <span>By <span className="font-semibold text-slate-900">{proposal.creator.name}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{proposal.locality}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Active since {format(new Date(proposal.created_at), 'PPP')}</span>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h4 className="text-slate-900 font-bold mb-3 uppercase tracking-tight text-sm">Proposal Details</h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {proposal.description}
              </p>
            </div>
          </div>

          {/* Voting Action */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Vote className="w-6 h-6 text-primary-500" /> Cast Your Vote
            </h3>
            <p className="text-slate-500 text-sm mb-8">
              Every resident of <strong>{proposal.locality}</strong> is encouraged to vote. Your vote influences municipal priority.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <form action={async () => { 'use server'; await castVote(proposal.proposal_id, true); }}>
                <button
                  type="submit"
                  disabled={userVote?.vote_type === true}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold shadow-sm transition-all active:scale-95 ${
                    userVote?.vote_type === true
                      ? 'bg-green-100 text-green-700 ring-2 ring-green-600'
                      : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-green-500 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" /> YES
                </button>
              </form>
              <form action={async () => { 'use server'; await castVote(proposal.proposal_id, false); }}>
                <button
                  type="submit"
                  disabled={userVote?.vote_type === false}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold shadow-sm transition-all active:scale-95 ${
                    userVote?.vote_type === false
                      ? 'bg-red-100 text-red-700 ring-2 ring-red-600'
                      : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-red-500 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" /> NO
                </button>
              </form>
            </div>
            {userVote !== undefined && (
              <p className="text-center text-xs text-slate-400 mt-4">
                You voted <strong>{userVote.vote_type ? 'YES' : 'NO'}</strong> on {format(new Date(), 'PPP')}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-6">Current Standing</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-black">{approvalRate.toFixed(1)}%</span>
                    <span className="text-xs text-slate-400 uppercase font-bold">YES Votes</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isApproved ? 'bg-green-400' : 'bg-primary-500'}`}
                      style={{ width: `${approvalRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 rounded-2xl p-4">
                    <span className="block text-2xl font-bold">{yesVotes}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Supports</span>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4">
                    <span className="block text-2xl font-bold">{noVotes}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Opposes</span>
                  </div>
                </div>

                <div className="bg-primary-600/20 border border-primary-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary-300">
                    <Info className="w-4 h-4" /> APPROVAL REQUIREMENTS
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Needs at least <strong>60% YES</strong> votes and <strong>{proposal.min_participation_threshold} total participants</strong> to be forwarded to authorities.
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className={`h-1.5 flex-1 rounded-full ${totalVotes >= proposal.min_participation_threshold ? 'bg-green-400' : 'bg-white/20'}`} />
                    <span className="text-[10px] font-bold">
                      {totalVotes}/{proposal.min_participation_threshold} Participants
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl -mr-16 -mt-16" />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Creator Rep</h4>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 font-black text-lg">
                🏆
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{proposal.creator.reputation_score} Points</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Civic Participation Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
