import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { PlusCircle, Calendar, MapPin, Clock, Users, Tag } from 'lucide-react'
import { format } from 'date-fns'

export default async function EventsPage() {
  const supabase = createClient()
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      location:location_ref (area, city),
      organizer:organizer_ref (name),
      rsvps:event_rsvps (status)
    `)
    .order('event_date', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Calendar className="w-10 h-10 text-amber-600" /> Local Events
          </h1>
          <p className="text-slate-500 mt-1">Join community drives, festivals, and volunteer activities.</p>
        </div>
        <Link
          href="/events/create"
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-6 py-3 text-sm font-black text-white shadow-xl shadow-amber-500/25 hover:bg-amber-500 hover:-translate-y-1 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> Host an Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events?.map((event) => {
          const participantCount = event.rsvps.filter((r: any) => r.status === 'Going').length
          const eventDate = new Date(event.event_date)
          
          return (
            <div key={event.event_id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="bg-slate-100 aspect-video relative flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent" />
                 <Calendar className="w-20 h-20 text-white opacity-20 group-hover:scale-110 transition-transform duration-500" />
                 <div className="absolute top-6 left-6 bg-white rounded-2xl p-3 shadow-lg flex flex-col items-center min-w-[60px]">
                    <span className="text-[10px] font-black text-amber-600 uppercase leading-none">{format(eventDate, 'MMM')}</span>
                    <span className="text-2xl font-black text-slate-900 leading-none mt-1">{format(eventDate, 'dd')}</span>
                 </div>
                 <div className="absolute bottom-6 left-6 flex gap-2">
                    <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                       {event.category}
                    </span>
                 </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-amber-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                  {event.description}
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    {event.location.area}, {event.location.city}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <Clock className="w-4 h-4 text-slate-300" />
                    {format(eventDate, 'p')}
                  </div>
                  
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                           {[1, 2, 3].map(i => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                 {i}
                              </div>
                           ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+ {participantCount} Going</span>
                     </div>
                     <Link 
                       href={`/events/${event.event_id}`}
                       className="text-xs font-black text-amber-600 uppercase tracking-widest hover:translate-x-1 transition-transform"
                     >
                        Details →
                     </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {(!events || events.length === 0) && (
          <div className="md:col-span-3 py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
             <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">No upcoming events</p>
             <p className="text-xs text-slate-400 mt-2">The community calendar is empty. Why not host a meetup?</p>
          </div>
        )}
      </div>
    </div>
  )
}
