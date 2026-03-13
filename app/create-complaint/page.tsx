'use client'

import { useState } from 'react'
import { createComplaint } from '@/app/actions/complaints'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Camera, MapPin, Tag } from 'lucide-react'

export default function CreateComplaintPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await createComplaint(formData)
    
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Issue reported successfully!')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white px-8 py-10 shadow-sm ring-1 ring-slate-200 sm:rounded-xl">
        <div className="mb-8 border-b border-gray-100 pb-5">
          <h2 className="text-2xl font-semibold leading-7 text-slate-900">Report a Civic Issue</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Provide detailed information about the locality problem. It will be directly sent to your local authorities.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium leading-6 text-slate-900">
                <Tag className="w-4 h-4 text-slate-400" /> Issue Category
              </label>
              <div className="mt-2 text-slate-900">
                <select
                  name="category"
                  required
                  className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                >
                  <option value="" disabled selected>Select category...</option>
                  <option value="sanitation">Sanitation & Garbage</option>
                  <option value="roads">Roads & Potholes</option>
                  <option value="electricity">Electricity & Street Lights</option>
                  <option value="water supply">Water Supply & Leaks</option>
                  <option value="public safety">Public Safety & Hazards</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">Description</label>
              <div className="mt-2">
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Describe the issue in detail..."
                  required
                  className="block w-full rounded-md border-0 px-3 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2 border-t border-gray-100 pt-6">
                <h3 className="text-sm font-medium leading-6 text-slate-900 flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400" /> Location Details
                </h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Area / Landmark</label>
                <div className="mt-2">
                  <input type="text" name="area" required className="block w-full rounded-md border-0 px-3 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">City</label>
                <div className="mt-2">
                  <input type="text" name="city" required className="block w-full rounded-md border-0 px-3 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Pincode</label>
                <div className="mt-2">
                  <input type="text" name="pincode" required className="block w-full rounded-md border-0 px-3 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Priority Level</label>
                <div className="mt-2">
                  <select name="priority" className="block w-full rounded-md border-0 px-3 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6">
                    <option value="Low">Low</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <label className="flex items-center gap-2 text-sm font-medium leading-6 text-slate-900">
                <Camera className="w-4 h-4 text-slate-400" /> Supporting Image (Optional)
              </label>
              <div className="mt-2">
                <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 items-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="image" type="file" accept="image/*" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6 border-t border-gray-100 pt-6">
            <button type="button" onClick={() => router.back()} className="text-sm font-semibold leading-6 text-slate-900">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
