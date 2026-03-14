'use client'

import { useEffect, useRef } from 'react'

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
}

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  'In Progress': '#3b82f6',
  Resolved: '#22c55e',
}

export default function ComplaintsMap({ complaints, userLat, userLng, radiusKm = 5 }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then(L => {
      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const centerLat = userLat ?? (complaints[0]?.lat || 19.076)
      const centerLng = userLng ?? (complaints[0]?.lng || 72.877)

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      // Free OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // User location marker + radius circle
      if (userLat && userLng) {
        const userIcon = L.divIcon({
          html: `<div style="
            width:16px; height:16px;
            background:#2563eb; border-radius:50%;
            border:3px solid white; box-shadow:0 0 0 3px rgba(37,99,235,0.3);
            animation: pulse 2s infinite;
          "></div>
          <style>@keyframes pulse{0%{box-shadow:0 0 0 3px rgba(37,99,235,0.3)}100%{box-shadow:0 0 0 12px rgba(37,99,235,0)}}</style>`,
          className: '',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })

        L.marker([userLat, userLng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<strong>📍 Your Location</strong>')

        // Radius circle
        L.circle([userLat, userLng], {
          radius: radiusKm * 1000,
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.05,
          weight: 2,
          dashArray: '6 4',
        }).addTo(map)
      }

      // Complaint markers
      complaints.forEach(comp => {
        if (!comp.lat || !comp.lng) return

        const color = STATUS_COLORS[comp.status] || '#6b7280'
        const icon = L.divIcon({
          html: `<div style="
            width:28px; height:28px;
            background:${color};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
            display:flex; align-items:center; justify-content:center;
          ">
            <div style="transform:rotate(45deg); font-size:12px; margin-top:2px;">
              ${comp.status === 'Resolved' ? '✓' : comp.priority === 'High' ? '!' : '•'}
            </div>
          </div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -30],
        })

        L.marker([comp.lat, comp.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif; min-width:180px;">
              <p style="font-weight:700;font-size:13px;margin:0 0 4px;">${comp.category_name}</p>
              <p style="font-size:11px;color:#6b7280;margin:0 0 6px;">${comp.area}, ${comp.city}</p>
              <p style="font-size:12px;color:#374151;margin:0 0 8px;">${comp.description.slice(0, 80)}${comp.description.length > 80 ? '...' : ''}</p>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <span style="font-size:10px;padding:2px 8px;border-radius:999px;background:${color}20;color:${color};font-weight:600;border:1px solid ${color}40;">${comp.status}</span>
                <span style="font-size:10px;padding:2px 8px;border-radius:999px;background:#f1f5f9;color:#64748b;">${comp.priority} Priority</span>
              </div>
              <a href="/complaints/${comp.complaint_id}" style="display:block;margin-top:8px;text-align:center;font-size:11px;font-weight:600;color:#2563eb;text-decoration:none;">View Details →</a>
            </div>
          `)
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapRef} style={{ height: '400px', width: '100%' }} />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 px-3 py-2.5 text-xs z-[1000]">
        <p className="font-semibold text-slate-700 mb-1.5">Complaint Status</p>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-slate-600">{status}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-gray-100">
          <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow" />
          <span className="text-slate-600">Your location</span>
        </div>
      </div>
      {/* Attribution */}
      <div className="absolute bottom-1 right-2 text-[9px] text-slate-400 z-[1000]">
        Map: © OpenStreetMap (Free)
      </div>
    </div>
  )
}
