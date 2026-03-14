'use client'

import dynamic from 'next/dynamic'
import { Map } from 'lucide-react'

const ComplaintsMap = dynamic(() => import('@/components/ComplaintsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 h-[400px]">
      <div className="text-center">
        <Map className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Loading map...</p>
      </div>
    </div>
  ),
})

type Complaint = {
  complaint_id: string
  description: string
  status: string
  priority: string
  lat: number
  lng: number
  category_name: string
  area: string
  city: string
}

type Props = {
  complaints: Complaint[]
  userLat?: number
  userLng?: number
  radiusKm?: number
  city: string
  totalCount: number
}

export default function LocalityMapWrapper({ complaints, userLat, userLng, radiusKm, city, totalCount }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Map className="w-5 h-5 text-primary-500" />
            Local Issues Map — {city}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalCount} civic issues in your locality ·
            <span className="text-indigo-600 ml-1">Data partitioned to your city only</span>
          </p>
        </div>
        {complaints.length === 0 && totalCount > 0 && (
          <p className="text-xs text-slate-400">📌 Issue GPS location when filing to see pins on the map</p>
        )}
      </div>
      <ComplaintsMap complaints={complaints} userLat={userLat} userLng={userLng} radiusKm={radiusKm} />
    </div>
  )
}
