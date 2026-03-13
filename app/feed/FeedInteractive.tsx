'use client'

import { useState } from 'react'
import { createPost, createComment, toggleLike } from '@/app/actions/social'
import { Heart, MessageCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export function CreatePostForm() {
  const [loading, setLoading] = useState(false)

  return (
    <form 
      className="bg-white p-4 shadow sm:rounded-lg mb-6 border border-gray-100"
      action={async (formData) => {
        setLoading(true)
        const res = await createPost(formData)
        if (res?.error) toast.error(res.error)
        else {
           toast.success('Post shared')
           formData.delete('content')
           // Ideally reset form, simple way is reset via document
           const formElement = document.getElementById('post-form') as HTMLFormElement
           formElement?.reset()
        }
        setLoading(false)
      }}
      id="post-form"
    >
      <div className="flex gap-4 items-start">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold overflow-hidden shadow-sm">
           Me
        </div>
        <div className="min-w-0 flex-1">
          <textarea
            rows={3}
            name="content"
            className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 resize-none"
            placeholder="Share an update or concern with your community..."
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Posting...' : 'Post Update'}
        </button>
      </div>
    </form>
  )
}

export function PostItem({ post, currentUserId }: { post: any, currentUserId: string }) {
  const [showComments, setShowComments] = useState(false)
  const isLiked = post.likes.some((like: any) => like.user_ref === currentUserId)
  const [postingComment, setPostingComment] = useState(false)
  const [liking, setLiking] = useState(false)

  const handleLike = async () => {
    setLiking(true)
    const res = await toggleLike(post.post_id, isLiked)
    if (res?.error) toast.error(res.error)
    setLiking(false)
  }

  const handleComment = async (formData: FormData) => {
    setPostingComment(true)
    const res = await createComment(formData)
    if (res?.error) toast.error(res.error)
    else {
       const form = document.getElementById(`comment-form-${post.post_id}`) as HTMLFormElement
       form?.reset()
    }
    setPostingComment(false)
  }

  return (
    <article className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-100 transition-all hover:border-primary-100 hover:shadow-md">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex space-x-3 items-center">
          <div className="flex-shrink-0">
             <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold shadow-sm ring-2 ring-white">
                {post.user.name.charAt(0).toUpperCase()}
             </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 group-hover:text-primary-600">
              {post.user.name}
            </p>
            <p className="text-xs text-slate-500">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <p className="mt-4 text-base text-slate-800 whitespace-pre-wrap">{post.content}</p>
        
        <div className="mt-6 flex gap-4 text-sm font-medium border-t border-gray-100 pt-4">
          <button 
            type="button" 
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-rose-600 hover:text-rose-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            {post.likes.length}
          </button>
          <button 
            type="button" 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {post.comments.length}
          </button>
        </div>
      </div>

      {showComments && (
        <div className="bg-slate-50 px-4 py-6 border-t border-gray-100">
           <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
             {post.comments.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-2">No comments yet. Be the first!</p>
             ) : (
                post.comments.map((comment: any) => (
                  <div key={comment.comment_id} className="flex space-x-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                     <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600 font-bold">
                           {comment.user.name.charAt(0).toUpperCase()}
                        </div>
                     </div>
                     <div>
                       <div className="text-sm">
                         <span className="font-semibold text-slate-900 mr-2">{comment.user.name}</span>
                         <span className="text-slate-500 text-xs">{new Date(comment.commented_at).toLocaleString()}</span>
                       </div>
                       <div className="mt-1 text-sm text-slate-700">{comment.text}</div>
                     </div>
                  </div>
                ))
             )}
           </div>

           <form 
              action={handleComment} 
              id={`comment-form-${post.post_id}`}
              className="mt-2 flex gap-2 items-center"
           >
              <input type="hidden" name="post_id" value={post.post_id} />
              <input
                type="text"
                name="text"
                placeholder="Write a comment..."
                className="block w-full rounded-full border-0 py-2 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              />
              <button
                type="submit"
                disabled={postingComment}
                className="inline-flex items-center justify-center rounded-full bg-primary-600 p-2 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
           </form>
        </div>
      )}
    </article>
  )
}
