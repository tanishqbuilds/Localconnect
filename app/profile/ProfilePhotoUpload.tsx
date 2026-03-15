'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2, User, CheckCircle2 } from 'lucide-react'
import { updateProfilePhoto } from '@/app/actions/profile'
import toast from 'react-hot-toast'

interface ProfilePhotoUploadProps {
  initialPhotoUrl?: string | null
  userName: string
}

export default function ProfilePhotoUpload({ initialPhotoUrl, userName }: ProfilePhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (e.g., 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size too large (max 2MB)')
      return
    }

    setUploading(true)
    const toastId = toast.loading('Uploading photo...')

    try {
      // 1. Upload to Cloudinary (using unsigned preset)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'LocalConnect')
      
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!res.ok) throw new Error('Cloudinary upload failed')

      const data = await res.json()
      const uploadedUrl = data.secure_url

      // 2. Update Supabase via Server Action
      await updateProfilePhoto(uploadedUrl)

      setPhotoUrl(uploadedUrl)
      toast.success('Profile photo updated!', { id: toastId })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload photo', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative group">
      <div className="w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl ring-1 ring-slate-100 relative overflow-hidden transition-all duration-500 group-hover:scale-[1.02]">
        <div className="w-full h-full rounded-[2.2rem] bg-slate-100 flex items-center justify-center text-5xl font-black text-slate-400 border border-slate-200 overflow-hidden relative">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={userName} 
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            userName.charAt(0).toUpperCase()
          )}

          {/* Overlay on hover */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
          >
            <Camera className="w-8 h-8 text-white" />
          </div>

          {/* Uploading indicator */}
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-md">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
          )}
        </div>
      </div>
      
      {/* Small success badge if photo exists */}
      {photoUrl && (
        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-2xl shadow-lg border-4 border-white">
           <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  )
}
