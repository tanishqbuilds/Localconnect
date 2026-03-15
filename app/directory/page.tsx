import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Store, Star, MapPin, Phone, Search, Filter, PlusCircle } from 'lucide-react'
import { BUSINESS_CATEGORIES } from '@/utils/constants'

export default async function BusinessDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; query?: string }>
}) {
  const params = await searchParams
  const supabase = createClient()

  let queryBuilder = supabase
    .from('businesses')
    .select(`
      *,
      location:location_ref (area, city),
      reviews:business_reviews (rating)
    `)

  if (params.category) {
    queryBuilder = queryBuilder.eq('category', params.category)
  }

  const { data: businesses } = await queryBuilder

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Business Directory</h1>
          <p className="text-slate-500 mt-1">Discover and support essential services in your locality.</p>
        </div>
        <Link
          href="/directory/register"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-indigo-500/25 hover:bg-indigo-500 hover:-translate-y-1 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> List Your Business
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" /> Categories
            </h3>
            <div className="space-y-1">
              <Link 
                href="/directory"
                className={`block px-3 py-2 rounded-xl text-sm font-bold transition-colors ${!params.category ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                All Services
              </Link>
              {BUSINESS_CATEGORIES.map(cat => (
                <Link 
                  key={cat.value}
                  href={`?category=${cat.label}`}
                  className={`block px-3 py-2 rounded-xl text-sm font-bold transition-colors ${params.category === cat.label ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white text-center">
             <Store className="w-10 h-10 text-indigo-400 mx-auto mb-4 opacity-50" />
             <p className="text-sm font-bold mb-4">Want to get verified?</p>
             <button className="w-full py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                Apply for Badge
             </button>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {businesses?.map((biz) => {
            const ratings = biz.reviews.map((r: any) => r.rating)
            const avgRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0
            
            return (
              <div key={biz.business_id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:bg-indigo-50 transition-colors">
                     {biz.category.includes('Plumber') ? '🔧' : 
                      biz.category.includes('Doctor') ? '👨‍⚕️' : 
                      biz.category.includes('Electrician') ? '⚡' : '🏠'}
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 font-black text-sm px-3 py-1 rounded-full border border-amber-100">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {avgRating > 0 ? avgRating.toFixed(1) : 'New'}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{biz.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{biz.category}</p>
                
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed flex-1">
                  {biz.description || 'Verified local service provider committed to community excellence.'}
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    {biz.location.area}, {biz.location.city}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <Phone className="w-4 h-4 text-slate-300" />
                    {biz.contact_info?.phone || 'Contact for details'}
                  </div>
                </div>

                <Link 
                  href={`/directory/${biz.business_id}`}
                  className="w-full py-4 bg-slate-50 rounded-2xl text-center text-xs font-black text-slate-600 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                >
                   View Profile & Reviews
                </Link>
              </div>
            )
          })}

          {(!businesses || businesses.length === 0) && (
            <div className="md:col-span-2 py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
               <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500 font-bold">No businesses found in this category.</p>
               <Link href="/directory" className="text-indigo-600 text-xs font-bold hover:underline mt-2 inline-block">Clear all filters</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
