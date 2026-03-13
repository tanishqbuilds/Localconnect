'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'

// Passing Server Action as a prop or directly importing it
export default function ClientFormRenderer({ 
   action, 
   complaint_id, 
   currentStatus 
}: { 
   action: (formData: FormData) => Promise<any>,
   complaint_id: string,
   currentStatus: string
}) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await action(formData)
    
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Complaint status updated successfully!')
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="complaint_id" value={complaint_id} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Update Status</label>
        <select name="status" defaultValue={currentStatus} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm">
           <option value="Pending">Pending</option>
           <option value="In Progress">In Progress</option>
           <option value="Resolved">Resolved</option>
        </select>
      </div>
      <div>
         <label className="block text-sm font-medium text-slate-700 mb-1">Add Note / Action Taken</label>
         <textarea name="update_text" rows={3} required placeholder="Describe what actions have been taken..." className="block w-full rounded-md border-0 py-1.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
      </div>
      <button type="submit" disabled={loading} className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 transition-colors">
         {loading ? 'Submitting...' : <><Send className="w-4 h-4"/> Publish Update</>}
      </button>
    </form>
  )
}
