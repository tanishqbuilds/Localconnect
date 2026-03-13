'use client'

import { useState } from 'react'
import { toggleFollow } from '@/app/actions/profile'
import { UserPlus, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FollowButton({ targetUserId, isFollowing }: { targetUserId: string, isFollowing: boolean }) {
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState(isFollowing)

  const handleToggle = async () => {
    setLoading(true)
    const res = await toggleFollow(targetUserId, following)
    if (res?.error) {
      toast.error(res.error)
    } else {
      setFollowing(!following)
      toast.success(following ? 'Unfollowed successfully' : 'Following successfully')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 ${
        following 
          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 ring-1 ring-inset ring-slate-300' 
          : 'bg-primary-600 text-white hover:bg-primary-500'
      }`}
    >
      {following ? <><UserCheck className="w-4 h-4"/> Following</> : <><UserPlus className="w-4 h-4"/> Follow</>}
    </button>
  )
}
