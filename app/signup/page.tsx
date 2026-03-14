'use client'

import { useState, useRef } from 'react'
import { signup } from '@/app/actions/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Upload, FileText, X, Loader2, Shield, User, MapPin, Briefcase } from 'lucide-react'
import { MAHARASHTRA_CITIES, OFFICER_TYPES } from '@/utils/constants'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'citizen' | 'officer'>('citizen')
  const [idDocUrl, setIdDocUrl] = useState('')
  const [additionalDocUrl, setAdditionalDocUrl] = useState('')
  const [uploadingId, setUploadingId] = useState(false)
  const [uploadingAdditional, setUploadingAdditional] = useState(false)
  const [idFileName, setIdFileName] = useState('')
  const [additionalFileName, setAdditionalFileName] = useState('')
  const [selectedOfficerType, setSelectedOfficerType] = useState('')
  const idInputRef = useRef<HTMLInputElement>(null)
  const additionalInputRef = useRef<HTMLInputElement>(null)

  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
      formData.append('folder', 'localconnect/officer_documents')

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      if (!cloudName) throw new Error('Cloudinary Cloud Name is missing in .env')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: 'POST', body: formData }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error?.message || 'Upload failed')
      }

      return data.secure_url
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      toast.error(`Upload error: ${(err as Error).message}`)
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
    } catch (err: unknown) {
      toast.error(`Upload error: ${(err as Error).message}`)
      setAdditionalFileName('')
    }
    setUploadingAdditional(false)
  }

  const handleSubmit = async (formData: FormData) => {
    if (role === 'officer' && !idDocUrl) {
      toast.error('Please upload your Government ID document')
      return
    }
    if (role === 'officer' && !selectedOfficerType) {
      toast.error('Please select your officer type / role')
      return
    }
    setLoading(true)
    const res = await signup(formData)
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Registration successful!')
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 shadow-lg shadow-primary-500/30 mb-4">
            {role === 'officer' ? <Shield className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-slate-900">
            Create your account
          </h2>
          <p className="mt-1 text-sm text-slate-500">Join LocalConnect – Maharashtra&apos;s civic platform</p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg bg-white p-8 shadow-xl rounded-2xl border border-gray-100">
        <form className="space-y-6" action={handleSubmit}>

          {/* Role Selection */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">I am a...</p>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex flex-col items-center gap-2 cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${role === 'citizen' ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600 shadow-sm' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                <input type="radio" name="role" value="citizen" className="sr-only" onChange={() => setRole('citizen')} checked={role === 'citizen'} />
                <User className={`w-7 h-7 ${role === 'citizen' ? 'text-primary-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-semibold ${role === 'citizen' ? 'text-primary-700' : 'text-slate-600'}`}>Citizen</span>
                <span className="text-xs text-slate-400">Report & track issues</span>
              </label>
              <label className={`flex flex-col items-center gap-2 cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${role === 'officer' ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600 shadow-sm' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                <input type="radio" name="role" value="officer" className="sr-only" onChange={() => setRole('officer')} checked={role === 'officer'} />
                <Shield className={`w-7 h-7 ${role === 'officer' ? 'text-primary-600' : 'text-slate-400'}`} />
                <span className={`text-sm font-semibold ${role === 'officer' ? 'text-primary-700' : 'text-slate-600'}`}>Officer</span>
                <span className="text-xs text-slate-400">Resolve & manage issues</span>
              </label>
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">Full Name</label>
              <input name="name" type="text" required placeholder="Enter your full name"
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">Email address</label>
              <input name="email" type="email" required placeholder="you@example.com"
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-slate-900">Phone Number</label>
              <input name="phone" type="tel" placeholder="+91 98765 43210"
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm" />
            </div>
          </div>

          {/* Locality */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <MapPin className="w-4 h-4 text-primary-500" /> Your Locality (Maharashtra)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
                <input name="state" type="text" value="Maharashtra" readOnly
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-500 bg-slate-50 shadow-sm ring-1 ring-inset ring-gray-200 sm:text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                <select name="city" required
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm">
                  <option value="" disabled>Select city...</option>
                  {MAHARASHTRA_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Officer-specific Fields */}
          {role === 'officer' && (
            <div className="border-t border-gray-100 pt-5 space-y-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Briefcase className="w-4 h-4 text-primary-500" /> Officer Details
              </h3>

              {/* Officer Type */}
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Officer Role / Type <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-400 mb-2">Select your official designation category</p>
                <div className="grid grid-cols-1 gap-2">
                  {OFFICER_TYPES.map(type => (
                    <label
                      key={type.value}
                      className={`flex items-center gap-3 cursor-pointer rounded-lg border px-4 py-3 transition-all ${
                        selectedOfficerType === type.value
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="officer_type"
                        value={type.value}
                        className="sr-only"
                        onChange={() => setSelectedOfficerType(type.value)}
                        checked={selectedOfficerType === type.value}
                      />
                      <span className="text-xl">{type.label.split(' ')[0]}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${selectedOfficerType === type.value ? 'text-primary-700' : 'text-slate-800'}`}>
                          {type.label.substring(type.label.indexOf(' ') + 1)}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{type.description}</p>
                      </div>
                      {selectedOfficerType === type.value && (
                        <div className="w-2 h-2 rounded-full bg-primary-600 shrink-0" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Department</label>
                  <input name="department" type="text" required placeholder="e.g. Mumbai Police"
                    className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Designation</label>
                  <input name="designation" type="text" required placeholder="e.g. Sub-Inspector"
                    className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Badge / Employee Number <span className="text-slate-400 font-normal">(optional)</span></label>
                <input name="badge_number" type="text" placeholder="e.g. MH/PO/12345"
                  className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm" />
              </div>

              {/* Document Upload Section */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Verification Documents</h4>
                <p className="text-xs text-slate-500 mb-4">Upload your ID and supporting documents for admin verification.</p>

                {/* Government ID (Required) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    Government ID <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-2">Aadhaar, PAN, Officer Badge, or other valid ID</p>
                  <input ref={idInputRef} type="file" accept="image/*,.pdf" className="sr-only" onChange={handleIdUpload} />
                  {!idDocUrl ? (
                    <button type="button" onClick={() => idInputRef.current?.click()} disabled={uploadingId}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-5 text-sm font-medium text-slate-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all disabled:opacity-50">
                      {uploadingId ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Uploading {idFileName}...</>
                      ) : (
                        <><Upload className="w-5 h-5" /> Click to upload Government ID</>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                      <FileText className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm text-green-700 font-medium truncate flex-1">{idFileName}</span>
                      <button type="button" onClick={() => { setIdDocUrl(''); setIdFileName(''); if (idInputRef.current) idInputRef.current.value = '' }}
                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Document */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    Additional Document <span className="text-slate-400">(optional)</span>
                  </label>
                  <p className="text-xs text-slate-400 mb-2">Appointment letter, transfer order, or other supporting proof</p>
                  <input ref={additionalInputRef} type="file" accept="image/*,.pdf" className="sr-only" onChange={handleAdditionalUpload} />
                  {!additionalDocUrl ? (
                    <button type="button" onClick={() => additionalInputRef.current?.click()} disabled={uploadingAdditional}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 text-sm font-medium text-slate-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all disabled:opacity-50">
                      {uploadingAdditional ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Uploading {additionalFileName}...</>
                      ) : (
                        <><Upload className="w-5 h-5" /> Click to upload additional document</>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                      <FileText className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm text-green-700 font-medium truncate flex-1">{additionalFileName}</span>
                      <button type="button" onClick={() => { setAdditionalDocUrl(''); setAdditionalFileName(''); if (additionalInputRef.current) additionalInputRef.current.value = '' }}
                        className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Hidden inputs */}
              <input type="hidden" name="id_document_url" value={idDocUrl} />
              <input type="hidden" name="additional_document_url" value={additionalDocUrl} />
            </div>
          )}

          <div className="border-t border-gray-100 pt-5">
            <label className="block text-sm font-medium leading-6 text-slate-900">Password</label>
            <input name="password" type="password" required placeholder="Create a strong password"
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm" />
          </div>

          <button
            type="submit"
            disabled={loading || uploadingId || uploadingAdditional}
            className="flex w-full justify-center rounded-xl bg-primary-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 transition-all hover:-translate-y-0.5"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2 inline" />Creating account...</> : role === 'officer' ? 'Submit for Approval' : 'Create Account'}
          </button>

          {role === 'officer' && (
            <p className="text-xs text-center text-amber-700 bg-amber-50 rounded-xl p-3 border border-amber-200">
              ⚠️ Officer accounts require admin approval. You&#39;ll be able to sign in after your application is reviewed (usually 1-2 business days).
            </p>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already a member?{' '}
          <Link href="/login" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
