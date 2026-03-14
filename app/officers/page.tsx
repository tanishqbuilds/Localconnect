import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, MapPin, Phone, Search, ArrowLeft } from 'lucide-react'
import { MAHARASHTRA_CITIES, OFFICER_TYPES, OFFICER_TYPE_COLORS } from '@/utils/constants'

export default async function OfficersDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; type?: string }>
}) {
  const params = await searchParams
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let query = supabase
    .from('officers')
    .select(`
      officer_id, officer_type, designation, department,
      city, state, badge_number,
      user_info:user_id (name, email, phone)
    `)
    .eq('is_approved', true)
    .order('city')

  if (params.city) query = query.eq('city', params.city)
  if (params.type) query = query.eq('officer_type', params.type)

  const { data: officers } = await query

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/citizen" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Officers Directory</h1>
        <p className="mt-1 text-sm text-slate-500">
          Find and connect with verified local officials across Maharashtra. Citizens can tag officers when reporting issues.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Filter Officers</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">By City</label>
            <div className="flex flex-wrap gap-2">
              <Link
                href={params.type ? `?type=${params.type}` : '/officers'}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!params.city ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-slate-600 hover:border-primary-400 hover:text-primary-600'}`}
              >
                All Cities
              </Link>
              {MAHARASHTRA_CITIES.map(city => (
                <Link
                  key={city}
                  href={`?city=${city}${params.type ? `&type=${params.type}` : ''}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${params.city === city ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-slate-600 hover:border-primary-400 hover:text-primary-600'}`}
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">By Role</label>
            <div className="flex flex-wrap gap-2">
              <Link
                href={params.city ? `?city=${params.city}` : '/officers'}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!params.type ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-slate-600 hover:border-primary-400 hover:text-primary-600'}`}
              >
                All Roles
              </Link>
              {OFFICER_TYPES.map(type => (
                <Link
                  key={type.value}
                  href={`?type=${type.value}${params.city ? `&city=${params.city}` : ''}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${params.type === type.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-slate-600 hover:border-primary-400 hover:text-primary-600'}`}
                >
                  {type.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{officers?.length || 0}</span> officers
          {params.city && <span> in <span className="font-semibold text-slate-900">{params.city}</span></span>}
          {params.type && <span> with role <span className="font-semibold text-slate-900">{params.type}</span></span>}
        </p>
        <Link
          href="/create-complaint"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-all"
        >
          Report & Tag an Officer
        </Link>
      </div>

      {/* Officers Grid */}
      {officers && officers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {officers.map(officer => {
            const colors = OFFICER_TYPE_COLORS[officer.officer_type] || OFFICER_TYPE_COLORS['Municipal Worker']
            const officerType = OFFICER_TYPES.find(t => t.value === officer.officer_type)
            const userInfo = officer.user_info as unknown as { name: string; email: string; phone: string }

            return (
              <div
                key={officer.officer_id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg} shadow-sm`}>
                    <Shield className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="min-w-0 flex-auto">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{userInfo?.name || 'Officer'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{officer.designation}</p>
                    <p className="text-xs text-slate-400 truncate">{officer.department}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${colors.bg} ${colors.text} ${colors.ring}`}>
                    {officerType?.label || officer.officer_type}
                  </span>

                  {officer.city && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {officer.city}, Maharashtra
                    </div>
                  )}

                  {userInfo?.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {userInfo.phone}
                    </div>
                  )}

                  {officer.badge_number && (
                    <div className="text-xs text-slate-400">
                      Badge: <span className="font-mono font-medium text-slate-600">{officer.badge_number}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs text-slate-400 mb-2">{officerType?.description}</p>
                  <Link
                    href={`/create-complaint?tagOfficer=${officer.officer_id}&city=${officer.city || ''}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${colors.text} hover:underline`}
                  >
                    <Shield className="w-3 h-3" /> Report & Tag this Officer
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Shield className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 mb-1">No officers found</h3>
          <p className="text-sm text-slate-400">Try changing your filters or check back later as more officers join.</p>
          <Link href="/officers" className="inline-block mt-4 text-sm font-semibold text-primary-600 hover:text-primary-500">
            Clear filters
          </Link>
        </div>
      )}
    </div>
  )
}
