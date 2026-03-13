import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreatePostForm, PostItem } from './FeedInteractive'
import { Megaphone } from 'lucide-react'

export default async function CommunityFeedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      post_id,
      content,
      media,
      created_at,
      user:user_ref (name, user_id),
      likes:likes (like_id, user_ref),
      comments:comments (comment_id, text, commented_at, user:user_ref (name))
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-7 text-slate-900 flex items-center gap-2">
           <Megaphone className="w-6 h-6 text-primary-600" /> Community Feed
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          News, updates, and discussions in your locality.
        </p>
      </div>

      <CreatePostForm />

      <div className="space-y-6 mt-10">
        {posts?.length === 0 ? (
           <div className="text-center py-10">
              <p className="text-slate-500 font-medium">No posts in your community yet.</p>
              <p className="text-sm text-slate-400 mt-1">Be the first to start a conversation!</p>
           </div>
        ) : (
          posts?.map((post) => (
             <PostItem key={post.post_id} post={post} currentUserId={user.id} />
          ))
        )}
      </div>
    </div>
  )
}
