import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  PlusCircle, Clock, CheckCircle, AlertCircle,
  FileText, MapPin, Users, Tag, Shield
} from 'lucide-react'
import { OFFICER_TYPE_COLORS } from '@/utils/constants'
import LocalityMapWrapper from '@/components/LocalityMapWrapper'

export default async function CitizenDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('name, city, state')
    .eq('user_id', user.id)
    .single()

  const userCity = userProfile?.city || user.user_metadata?.city

  // Fetch complaints ONLY from user's city (Horizontal Fragmentation)
  const complaintsQuery = supabase
    .from('complaints')
    .select(`
      *,
      category:category_ref (category_name),
      location:location_ref (area, city, latitude, longitude)
    `)
    .order('created_at', { ascending: false })

  // My complaints (always show mine regardless of city)
  const { data: myComplaints, error } = await complaintsQuery
    .eq('created_by', user.id)

  // Community complaints in my city zone — Horizontal Fragmentation
  let communityComplaints: typeof myComplaints = []
  if (userCity) {
    const { data: cityComplaints } = await supabase
      .from('complaints')
      .select(`
        complaint_id, description, status, priority,
        category:category_ref (category_name),
        location:location_ref (area, city, latitude, longitude)
      `)
      .order('created_at', { ascending: false })
      .limit(50)
    // Filter by city via location join
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    communityComplaints = (cityComplaints || []).filter((c: any) =>
      c.location?.city === userCity
    )
  }

  if (error) console.error(error)

  // Get officers in user's city
  const { data: localOfficers } = userCity ? await supabase
    .from('officers')
    .select(`officer_id, officer_type, designation, department, city, user_info:user_id (name)`)
    .eq('is_approved', true)
    .eq('city', userCity)
    .limit(6) : { data: null }

  const pending = myComplaints?.filter(c => c.status === 'Pending').length || 0
  const inProgress = myComplaints?.filter(c => c.status === 'In Progress').length || 0
  const resolved = myComplaints?.filter(c => c.status === 'Resolved').length || 0

  // Prepare map data — complaints with coordinates
  type LocationShape = { area: string; city: string; latitude?: number; longitude?: number }
  type CategoryShape = { category_name: string }

  const mapComplaints = communityComplaints
    .filter(c => {
      const loc = c.location as LocationShape
      return loc?.latitude && loc?.longitude
    })
    .map(c => {
      const loc = c.location as LocationShape
      const cat = c.category as CategoryShape
      return {
        complaint_id: c.complaint_id,
        description: c.description,
        status: c.status,
        priority: c.priority,
        lat: loc.latitude!,
        lng: loc.longitude!,
        category_name: cat?.category_name || 'General',
        area: loc.area,
        city: loc.city,
      }
    })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl">My Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 flex items-center gap-2 flex-wrap">
            Welcome, <span className="font-semibold text-slate-700">{user.user_metadata?.name || userProfile?.name || 'Citizen'}</span>
            {userCity && (
              <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
                <MapPin className="w-3 h-3" /> {userCity}, Maharashtra
              </span>
            )}
          </p>
          {userCity && (
            <p className="mt-1 text-xs text-indigo-600 flex items-center gap-1">
              🗄️ Showing data partitioned to your locality: <strong>{userCity}</strong> (Horizontal Fragmentation)
            </p>
          )}
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link href="/officers"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 transition-all">
            <Users className="w-4 h-4" /> Find Officers
          </Link>
          <Link href="/create-complaint"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 hover:-translate-y-0.5 transition-all">
            <PlusCircle className="w-5 h-5" /> Report Issue
          </Link>
        </div>
      </div>

      {/* Stats */}
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Pending Issues', value: pending, icon: Clock, borderColor: 'border-l-yellow-400', iconColor: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'In Progress', value: inProgress, icon: AlertCircle, borderColor: 'border-l-blue-400', iconColor: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Resolved', value: resolved, icon: CheckCircle, borderColor: 'border-l-green-400', iconColor: 'text-green-500', bg: 'bg-green-50' },
        ].map(stat => (
          <div key={stat.label}
            className={`overflow-hidden rounded-xl bg-white px-5 py-5 shadow-sm border border-gray-100 border-l-4 ${stat.borderColor} hover:shadow-md transition-shadow`}>
            <dt className="truncate text-sm font-medium text-slate-500 flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
              {stat.label}
            </dt>
            <dd className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {/* MAP — Community complaints in your locality */}
      {userCity && (
        <div>
          {communityComplaints.length === 0 ? (
            <div className="flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 h-36">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No community issues reported in {userCity} yet.</p>
                <Link href="/create-complaint" className="text-xs font-semibold text-primary-600 hover:underline mt-1 inline-block">Be the first to report →</Link>
              </div>
            </div>
          ) : (
            <LocalityMapWrapper
              complaints={mapComplaints}
              city={userCity}
              totalCount={communityComplaints.length}
              radiusKm={5}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Complaints */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900">My Reported Issues</h2>
              </div>
              {myComplaints && myComplaints.length > 0 && (
                <span className="text-xs text-slate-400">{myComplaints.length} total</span>
              )}
            </div>
            <ul role="list" className="divide-y divide-gray-100">
              {myComplaints?.length === 0 ? (
                <li className="px-5 py-12 text-center">
                  <PlusCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">No reports yet</p>
                  <p className="text-xs text-slate-400 mt-1">Start by reporting an issue in your locality.</p>
                  <Link href="/create-complaint" className="inline-block mt-4 text-sm font-semibold text-primary-600 hover:text-primary-500">
                    Report your first issue →
                  </Link>
                </li>
              ) : (
                myComplaints?.map(complaint => {
                  const loc = complaint.location as LocationShape
                  const cat = complaint.category as CategoryShape
                  return (
                    <li key={complaint.complaint_id} className="relative flex justify-between gap-x-6 px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex min-w-0 gap-x-4 items-center">
                        <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${
                          complaint.status === 'Resolved' ? 'bg-green-100' :
                          complaint.status === 'In Progress' ? 'bg-blue-100' : 'bg-yellow-100'
                        }`}>
                          {complaint.status === 'Resolved' ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                           complaint.status === 'In Progress' ? <AlertCircle className="h-5 w-5 text-blue-600" /> :
                           <Clock className="h-5 w-5 text-yellow-600" />}
                        </div>
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm font-semibold leading-6 text-slate-900">
                            <Link href={`/complaints/${complaint.complaint_id}`}>
                              <span className="absolute inset-x-0 -top-px bottom-0" />
                              {cat?.category_name?.charAt(0).toUpperCase() + cat?.category_name?.slice(1)} Issue
                            </Link>
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" /> {loc?.area}, {loc?.city}
                          </p>
                          {complaint.tagged_officers && (complaint.tagged_officers as string[]).length > 0 && (
                            <span className="text-xs text-primary-600 flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {(complaint.tagged_officers as string[]).length} officer{(complaint.tagged_officers as string[]).length > 1 ? 's' : ''} notified
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          complaint.priority === 'High' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                          complaint.priority === 'Medium' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                          'bg-slate-50 text-slate-600 ring-slate-500/10'
                        }`}>
                          {complaint.priority}
                        </span>
                        <div className="hidden sm:block text-xs text-slate-400">
                          <time dateTime={complaint.created_at}>{new Date(complaint.created_at).toLocaleDateString('en-IN')}</time>
                        </div>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </div>

        {/* Local Officers Panel */}
        <div>
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-900">
                  {userCity ? `Officers in ${userCity}` : 'Local Officers'}
                </h2>
              </div>
              <Link href="/officers" className="text-xs font-semibold text-primary-600 hover:text-primary-500">View all</Link>
            </div>

            {!userCity ? (
              <div className="p-5 text-center text-sm text-slate-400">
                <MapPin className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p>Report an issue with GPS to set your locality and see local officers.</p>
              </div>
            ) : localOfficers && localOfficers.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {localOfficers.map(officer => {
                  const colors = OFFICER_TYPE_COLORS[officer.officer_type] || OFFICER_TYPE_COLORS['Municipal Worker']
                  return (
                    <li key={officer.officer_id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colors.bg}`}>
                        <Shield className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {(officer.user_info as unknown as { name: string })?.name || 'Officer'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{officer.designation}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset shrink-0 ${colors.bg} ${colors.text} ${colors.ring}`}>
                        {officer.officer_type?.split(' ')[0]}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="p-5 text-center text-sm text-slate-400">
                <p>No officers registered in {userCity} yet.</p>
              </div>
            )}

            <div className="px-5 py-3 border-t border-gray-100 bg-slate-50">
              <Link href="/create-complaint"
                className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-primary-600 hover:text-primary-700 py-1">
                <PlusCircle className="w-4 h-4" /> Report & tag a local officer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
