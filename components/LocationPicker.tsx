'use client'

import { useState, useCallback } from 'react'
import { MapPin, Loader2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { MAHARASHTRA_CITIES } from '@/utils/constants'

export type LocationData = {
  lat: number
  lng: number
  city: string
  area: string
  pincode: string
  state: string
  displayName: string
}

type Props = {
  onLocationSet: (loc: LocationData) => void
  currentLocation: LocationData | null
}

// Free reverse geocoding via OpenStreetMap Nominatim (no API key needed)
async function reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'LocalConnect-CivicApp/1.0',
        },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const addr = data.address

    // Extract city — Nominatim uses different fields depending on region
    const rawCity =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.county ||
      addr.suburb ||
      ''

    // Find best matching Maharashtra city
    const matchedCity =
      MAHARASHTRA_CITIES.find(c =>
        rawCity.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(rawCity.toLowerCase())
      ) || rawCity

    const area = addr.suburb || addr.neighbourhood || addr.road || addr.village || ''
    const pincode = addr.postcode || ''
    const state = addr.state || 'Maharashtra'

    return {
      lat,
      lng,
      city: matchedCity,
      area,
      pincode,
      state,
      displayName: data.display_name || '',
    }
  } catch {
    return null
  }
}

export default function LocationPicker({ onLocationSet, currentLocation }: Props) {
  const [detecting, setDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualCity, setManualCity] = useState(currentLocation?.city || '')
  const [manualArea, setManualArea] = useState(currentLocation?.area || '')
  const [manualPincode, setManualPincode] = useState(currentLocation?.pincode || '')
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')

  const detectLocation = useCallback(async () => {
    setError(null)
    setDetecting(true)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setDetecting(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const loc = await reverseGeocode(latitude, longitude)

        if (loc) {
          onLocationSet(loc)
          setManualCity(loc.city)
          setManualArea(loc.area)
          setManualPincode(loc.pincode)
        } else {
          setError('Could not determine your address. Please enter manually.')
          setMode('manual')
        }
        setDetecting(false)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied. Please enter your location manually.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable. Please enter manually.')
            break
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.')
            break
          default:
            setError('An unknown error occurred.')
        }
        setMode('manual')
        setDetecting(false)
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    )
  }, [onLocationSet])

  const handleManualSubmit = () => {
    if (!manualCity || !manualArea || !manualPincode) return
    onLocationSet({
      lat: 0,
      lng: 0,
      city: manualCity,
      area: manualArea,
      pincode: manualPincode,
      state: 'Maharashtra',
      displayName: `${manualArea}, ${manualCity}, Maharashtra`,
    })
  }

  return (
    <div className="space-y-4">
      {/* Auto-detect button */}
      {mode === 'auto' && !currentLocation && (
        <button
          type="button"
          onClick={detectLocation}
          disabled={detecting}
          className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary-300 bg-primary-50/50 px-5 py-5 text-sm font-semibold text-primary-700 hover:bg-primary-50 hover:border-primary-400 transition-all disabled:opacity-60"
        >
          {detecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Detecting your location via GPS...
            </>
          ) : (
            <>
              <MapPin className="w-5 h-5" />
              📍 Auto-Detect My Location
              <span className="ml-1 text-xs font-normal text-primary-500">(uses GPS + OpenStreetMap)</span>
            </>
          )}
        </button>
      )}

      {/* Detected location display */}
      {currentLocation && currentLocation.lat !== 0 && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800">Location Detected ✓</p>
              <p className="text-xs text-green-600 mt-0.5 truncate">{currentLocation.displayName}</p>
              <div className="flex gap-4 mt-2 text-xs text-green-700">
                <span>📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
                <span>🏙️ {currentLocation.city}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { detectLocation(); }}
              className="shrink-0 text-green-600 hover:text-green-800 transition-colors"
              title="Re-detect location"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Mode toggle */}
      {!detecting && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
            className="underline hover:text-primary-600 transition-colors"
          >
            {mode === 'auto' ? '✏️ Enter location manually instead' : '📍 Use auto-detection instead'}
          </button>
        </div>
      )}

      {/* Manual entry or city correction */}
      {(mode === 'manual' || currentLocation) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              City <span className="text-red-500">*</span>
            </label>
            <select
              name="city"
              required
              value={manualCity}
              onChange={e => {
                setManualCity(e.target.value)
                if (currentLocation) {
                  onLocationSet({ ...currentLocation, city: e.target.value })
                }
              }}
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
            >
              <option value="">Select city...</option>
              {MAHARASHTRA_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              required
              value={manualPincode}
              onChange={e => {
                setManualPincode(e.target.value)
                if (currentLocation) {
                  onLocationSet({ ...currentLocation, pincode: e.target.value })
                }
              }}
              placeholder="400001"
              pattern="[0-9]{6}"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Area / Landmark <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="area"
              required
              value={manualArea}
              onChange={e => {
                setManualArea(e.target.value)
                if (currentLocation) {
                  onLocationSet({ ...currentLocation, area: e.target.value })
                }
              }}
              placeholder="e.g. Near Shivaji Chowk, Andheri West"
              className="block w-full rounded-xl border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
            />
          </div>
        </div>
      )}

      {/* Confirm manual location */}
      {mode === 'manual' && !currentLocation && (
        <button
          type="button"
          onClick={handleManualSubmit}
          disabled={!manualCity || !manualArea || !manualPincode}
          className="w-full rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-600 disabled:opacity-40 transition-all"
        >
          ✓ Confirm Location
        </button>
      )}

      {/* Hidden fields for form submission */}
      <input type="hidden" name="lat" value={currentLocation?.lat ?? ''} />
      <input type="hidden" name="lng" value={currentLocation?.lng ?? ''} />
      <input type="hidden" name="state" value={currentLocation?.state ?? 'Maharashtra'} />
    </div>
  )
}
