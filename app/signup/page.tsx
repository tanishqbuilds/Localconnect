'use client'

import { useState, useRef } from 'react'
import { signup } from '@/app/actions/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Upload, FileText, X, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'citizen' | 'officer'>('citizen')
  const [idDocUrl, setIdDocUrl] = useState('')
  const [additionalDocUrl, setAdditionalDocUrl] = useState('')
  const [uploadingId, setUploadingId] = useState(false)
  const [uploadingAdditional, setUploadingAdditional] = useState(false)
  const [idFileName, setIdFileName] = useState('')
  const [additionalFileName, setAdditionalFileName] = useState('')
  const idInputRef = useRef<HTMLInputElement>(null)
  const additionalInputRef = useRef<HTMLInputElement>(null)

  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
      formData.append('folder', 'localconnect/officer_documents')

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) throw new Error("Cloudinary Cloud Name is missing in .env");

      console.log(`Uploading to Cloudinary [${cloudName}] with preset [${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}]...`)

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: 'POST', body: formData }
      )

      const data = await res.json()
      
      if (!res.ok) {
        console.error("Cloudinary upload error response:", data)
        throw new Error(data.error?.message || 'Upload failed')
      }
      
      console.log("Cloudinary upload success:", data.secure_url)
      return data.secure_url
    } catch (err: any) {
      console.error("Cloudinary upload exception:", err)
      throw err
    }
  }

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB')
      return
    }
    setUploadingId(true)
    setIdFileName(file.name)
    try {
      const url = await uploadToCloudinary(file)
      setIdDocUrl(url)
      toast.success('ID document uploaded')
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`)
      setIdFileName('')
    }
    setUploadingId(false)
  }

  const handleAdditionalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB')
      return
    }
    setUploadingAdditional(true)
    setAdditionalFileName(file.name)
    try {
      const url = await uploadToCloudinary(file)
      setAdditionalDocUrl(url)
      toast.success('Document uploaded')
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`)
      setAdditionalFileName('')
    }
    setUploadingAdditional(false)
  }

  const handleSubmit = async (formData: FormData) => {
    if (role === 'officer' && !idDocUrl) {
      toast.error('Please upload your Government ID document')
      return
    }
    setLoading(true)
    const res = await signup(formData)
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Registration successful. You can log in now.')
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-slate-900">
          Create an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 shadow rounded-lg border border-gray-100">
        <form className="space-y-6" action={handleSubmit}>
          
          <div className="flex gap-4 mb-6">
            <label className={`flex-1 cursor-pointer rounded-lg border p-4 text-center transition-all ${role === 'citizen' ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="role" value="citizen" className="sr-only" onChange={() => setRole('citizen')} checked={role === 'citizen'} />
              <span className="block text-sm font-medium text-slate-900">Citizen</span>
            </label>
            <label className={`flex-1 cursor-pointer rounded-lg border p-4 text-center transition-all ${role === 'officer' ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="role" value="officer" className="sr-only" onChange={() => setRole('officer')} checked={role === 'officer'} />
              <span className="block text-sm font-medium text-slate-900">Officer</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">Full Name</label>
            <div className="mt-2">
              <input name="name" type="text" required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">Email address</label>
            <div className="mt-2">
              <input name="email" type="email" required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">Phone</label>
            <div className="mt-2">
              <input name="phone" type="text" className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          {role === 'officer' && (
             <>
               <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Department</label>
                  <div className="mt-2">
                    <input name="department" type="text" required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Designation</label>
                  <div className="mt-2">
                    <input name="designation" type="text" required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="border-t border-gray-200 pt-5 mt-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Verification Documents</h3>
                  <p className="text-xs text-slate-500 mb-4">Upload your ID and supporting documents for admin verification. Your registration will be reviewed before approval.</p>

                  {/* Government ID (Required) */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      Government ID <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-2">Aadhaar, PAN, Officer Badge, or other valid ID</p>
                    <input
                      ref={idInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={handleIdUpload}
                    />
                    {!idDocUrl ? (
                      <button
                        type="button"
                        onClick={() => idInputRef.current?.click()}
                        disabled={uploadingId}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm font-medium text-slate-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all disabled:opacity-50"
                      >
                        {uploadingId ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Uploading {idFileName}...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Click to upload Government ID
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                        <FileText className="w-5 h-5 text-green-600 shrink-0" />
                        <span className="text-sm text-green-700 font-medium truncate flex-1">{idFileName}</span>
                        <button
                          type="button"
                          onClick={() => { setIdDocUrl(''); setIdFileName(''); if (idInputRef.current) idInputRef.current.value = '' }}
                          className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Additional Document (Optional) */}
                  <div>
                    <label className="block text-sm font-medium leading-6 text-slate-900">
                      Additional Document <span className="text-slate-400">(optional)</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-2">Appointment letter, transfer order, or other supporting proof</p>
                    <input
                      ref={additionalInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={handleAdditionalUpload}
                    />
                    {!additionalDocUrl ? (
                      <button
                        type="button"
                        onClick={() => additionalInputRef.current?.click()}
                        disabled={uploadingAdditional}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-4 text-sm font-medium text-slate-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all disabled:opacity-50"
                      >
                        {uploadingAdditional ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Uploading {additionalFileName}...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Click to upload additional document
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                        <FileText className="w-5 h-5 text-green-600 shrink-0" />
                        <span className="text-sm text-green-700 font-medium truncate flex-1">{additionalFileName}</span>
                        <button
                          type="button"
                          onClick={() => { setAdditionalDocUrl(''); setAdditionalFileName(''); if (additionalInputRef.current) additionalInputRef.current.value = '' }}
                          className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Hidden inputs for document URLs */}
                <input type="hidden" name="id_document_url" value={idDocUrl} />
                <input type="hidden" name="additional_document_url" value={additionalDocUrl} />
             </>
          )}

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">Password</label>
            <div className="mt-2">
              <input name="password" type="password" required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || uploadingId || uploadingAdditional}
              className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : role === 'officer' ? 'Submit for Approval' : 'Sign up'}
            </button>
          </div>

          {role === 'officer' && (
            <p className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-200">
              ⚠️ Officer accounts require admin approval. You'll be able to sign in after your application is reviewed.
            </p>
          )}
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already a member?{' '}
          <Link href="/login" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
