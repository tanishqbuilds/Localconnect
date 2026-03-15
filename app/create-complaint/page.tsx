'use client'

import { useState, useCallback } from 'react'
import { createComplaint } from '@/app/actions/complaints'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Camera, Tag, Users, AlertTriangle, Loader2, MapPin } from 'lucide-react'
import { COMPLAINT_CATEGORIES, OFFICER_TYPE_COLORS } from '@/utils/constants'
import { createClient } from '@/utils/supabase/client'
import LocationPicker, { type LocationData } from '@/components/LocationPicker'

type Officer = {
  officer_id: string
  officer_type: string
  designation: string
  department: string
  city: string
  user_id: { name: string }
}

export default function CreateComplaintPage() {
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [location, setLocation] = useState<LocationData | null>(null)
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loadingOfficers, setLoadingOfficers] = useState(false)
  const [taggedOfficers, setTaggedOfficers] = useState<string[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()

  const handleLocationSet = useCallback(async (loc: LocationData) => {
    setLocation(loc)
    setTaggedOfficers([])

    if (!loc.city) return
    setLoadingOfficers(true)
    const supabase = createClient()

    let query = supabase
      .from('officers')
      .select('officer_id, officer_type, designation, department, city, user_id:user_id(name)')
      .eq('city', loc.city)
      .eq('is_approved', true)

    const cat = COMPLAINT_CATEGORIES.find(c => c.value === selectedCategory)
    if (cat) {
      query = query.in('officer_type', cat.relevantOfficers as unknown as string[])
    }

    const { data } = await query
    setOfficers((data as unknown as Officer[]) || [])
    setLoadingOfficers(false)
  }, [selectedCategory])

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category)
    if (!location?.city) return

    setLoadingOfficers(true)
    const supabase = createClient()
    const cat = COMPLAINT_CATEGORIES.find(c => c.value === category)

    let query = supabase
      .from('officers')
      .select('officer_id, officer_type, designation, department, city, user_id:user_id(name)')
      .eq('city', location.city)
      .eq('is_approved', true)

    if (cat) {
      query = query.in('officer_type', cat.relevantOfficers as unknown as string[])
    }

    const { data } = await query
    setOfficers((data as unknown as Officer[]) || [])
    setLoadingOfficers(false)
  }

  const toggleOfficer = (id: string) => {
    setTaggedOfficers(prev =>
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!location) {
      toast.error('Please detect or enter your location first.')
      return
    }
    if (!selectedCategory) {
      toast.error('Please select an issue category.')
      return
    }

    setLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('tagged_officers', JSON.stringify(taggedOfficers))
    if (imageFile) formData.set('image', imageFile)

    const res = await createComplaint(formData)
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Issue reported successfully! Officers in your area have been notified.')
    }
  }

  const selectedCategoryData = COMPLAINT_CATEGORIES.find(c => c.value === selectedCategory)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white px-8 py-10 shadow-sm ring-1 ring-slate-200 sm:rounded-2xl">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-2xl font-bold leading-7 text-slate-900">Report a Civic Issue</h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Your complaint will be routed to officers in <strong>your locality only</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* STEP 1: Location (priority — determines officers shown) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">1</div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" /> Detect Your Location
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-3 pl-8">
              We use your GPS location to show only issues in your area and route to local officers.
            </p>
            <div className="pl-8">
              <LocationPicker onLocationSet={handleLocationSet} currentLocation={location} />
            </div>
          </div>

          {/* STEP 2: Category */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">2</div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary-500" /> Issue Category
              </h3>
            </div>
            <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMPLAINT_CATEGORIES.map(cat => (
                <label
                  key={cat.value}
                  className={`flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-2.5 transition-all ${
                    selectedCategory === cat.value
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    className="sr-only"
                    onChange={() => handleCategoryChange(cat.value)}
                  />
                  <span className={`text-sm font-medium ${selectedCategory === cat.value ? 'text-primary-700' : 'text-slate-700'}`}>
                    {cat.label}
                  </span>
                  {selectedCategory === cat.value && <div className="ml-auto w-2 h-2 rounded-full bg-primary-600 shrink-0" />}
                </label>
              ))}
            </div>
          </div>

          {/* STEP 3: Description */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">3</div>
              <h3 className="text-sm font-bold text-slate-900">Describe the Issue</h3>
            </div>
            <div className="pl-8 space-y-4">
              <textarea
                name="description"
                rows={4}
                placeholder="Provide clear details: What's wrong? Since when? How severe? Any immediate safety concern?"
                required
                className="block w-full rounded-xl border-0 px-4 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm leading-relaxed"
              />
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Priority Level</label>
                <select name="priority" className="block rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm">
                  <option value="Low">🟢 Low</option>
                  <option value="Medium" defaultChecked>🟡 Medium</option>
                  <option value="High">🔴 High — Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 4: Tag Officers */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">4</div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-500" /> Tag Local Officers
              </h3>
            </div>
            <div className="pl-8">
              {!location && (
                <p className="text-xs text-slate-400 py-3">📍 Detect your location first to see available local officers.</p>
              )}

              {location && loadingOfficers && (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading officers in {location.city}...
                </div>
              )}

              {location && !loadingOfficers && officers.length === 0 && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      No officers found in {location.city}
                      {selectedCategoryData ? ` for ${selectedCategoryData.label}` : ''}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Your complaint will still be filed and visible to all officers in your area.
                    </p>
                  </div>
                </div>
              )}

              {officers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-2">
                    Select officers to notify — filtered to {location?.city} · relevant roles for &quot;{selectedCategoryData?.label}&quot;
                  </p>
                  {officers.map(officer => {
                    const colors = OFFICER_TYPE_COLORS[officer.officer_type] || OFFICER_TYPE_COLORS['Municipal Worker']
                    const isTagged = taggedOfficers.includes(officer.officer_id)
                    return (
                      <label
                        key={officer.officer_id}
                        className={`flex items-center gap-4 cursor-pointer rounded-xl border px-4 py-3 transition-all ${
                          isTagged ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={isTagged}
                          onChange={() => toggleOfficer(officer.officer_id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {(officer.user_id as unknown as { name: string })?.name || 'Officer'}
                          </p>
                          <p className="text-xs text-slate-500">{officer.designation} · {officer.department}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${colors.bg} ${colors.text} ${colors.ring}`}>
                          {officer.officer_type}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* STEP 5: Photo */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">5</div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary-500" /> Photo Evidence
                <span className="text-slate-400 font-normal text-xs">(optional but recommended)</span>
              </h3>
            </div>
            <div className="pl-8">
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-44">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 shadow text-xs font-semibold text-red-500 hover:bg-red-50"
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all">
                  <Camera className="mx-auto h-9 w-9 text-gray-300 mb-2" />
                  <span className="text-sm font-medium text-primary-600">Click to attach a photo</span>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  <input type="file" name="image" accept="image/*" className="sr-only" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          {/* Location summary */}
          {location && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 text-sm">
              <p className="font-semibold text-slate-700 mb-1">📋 Complaint Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>📍 Location: <strong className="text-slate-700">{location.area}, {location.city}</strong></span>
                <span>📌 Pin: <strong className="text-slate-700">{location.pincode}</strong></span>
                <span>🏷️ Category: <strong className="text-slate-700">{selectedCategoryData?.label || '—'}</strong></span>
                <span>👥 Tagged: <strong className="text-slate-700">{taggedOfficers.length} officer{taggedOfficers.length !== 1 ? 's' : ''}</strong></span>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-x-4 border-t border-gray-100 pt-6">
            <button type="button" onClick={() => router.back()} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !location}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                '📤 Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
