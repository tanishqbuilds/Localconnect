import Link from 'next/link'
import { 
  Vote, Heart, Calendar, Store, Search, 
  Settings, ShieldAlert, Zap, Repeat, LayoutDashboard,
  Gem, Users, Megaphone
} from 'lucide-react'

const MODULES = [
  { 
    title: 'Civic Voting', 
    desc: 'Propose and vote on local infrastructure projects.', 
    href: '/proposals', 
    icon: Vote, 
    color: 'bg-primary-100 text-primary-600' 
  },
  { 
    title: 'Help Network', 
    desc: 'Request or offer emergency aid and local support.', 
    href: '/help', 
    icon: Heart, 
    color: 'bg-rose-100 text-rose-600' 
  },
  { 
    title: 'Local Events', 
    desc: 'Join community drives, festivals, and activities.', 
    href: '/events', 
    icon: Calendar, 
    color: 'bg-amber-100 text-amber-600' 
  },
  { 
    title: 'Business Directory', 
    desc: 'Find and review essential services near you.', 
    href: '/directory', 
    icon: Store, 
    color: 'bg-indigo-100 text-indigo-600' 
  },
  { 
    title: 'Safety Reports', 
    desc: 'Report broken lights, hazards, and concerns.', 
    href: '/safety', 
    icon: ShieldAlert, 
    color: 'bg-orange-100 text-orange-600' 
  },
  { 
    title: 'Neighborhood Alerts', 
    desc: 'Real-time broadcasts from authorities.', 
    href: '/alerts', 
    icon: Zap, 
    color: 'bg-yellow-100 text-yellow-600' 
  },
]

export default function ExploreHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl mb-4">
          The Hyperlocal Ecosystem
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          LocalConnect is more than just reporting. It&apos;s a complete suite of tools designed to build stronger, safer, and more connected neighborhoods.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MODULES.map((module) => (
          <Link 
            key={module.title} 
            href={module.href}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all flex flex-col items-start text-left"
          >
            <div className={`p-4 rounded-2xl ${module.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
              <module.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{module.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {module.desc}
            </p>
            <div className="mt-auto flex items-center gap-2 text-xs font-black text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Module <span>→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-20 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 lg:flex items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-black mb-4">Hyperlocal News Feed</h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Stay updated with everything happening in your exact area. From approved proposals to emergency help requests nearby, the feed is curated for you.
            </p>
            <Link 
              href="/feed"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary-50 transition-colors"
            >
              <Megaphone className="w-5 h-5 mr-1" /> View Live Feed
            </Link>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4 flex-shrink-0">
             <div className="bg-white/5 rounded-3xl p-6 border border-white/10 w-48 h-48 flex flex-col justify-center items-center">
                <ShieldAlert className="w-10 h-10 text-yellow-400 mb-2" />
                <span className="text-xs font-bold">Safety Alerts</span>
             </div>
             <div className="bg-white/5 rounded-3xl p-6 border border-white/10 w-48 h-48 flex flex-col justify-center items-center -mt-8">
                <Vote className="w-10 h-10 text-blue-400 mb-2" />
                <span className="text-xs font-bold">Live Voting</span>
             </div>
             <div className="bg-white/5 rounded-3xl p-6 border border-white/10 w-48 h-48 flex flex-col justify-center items-center">
                <Heart className="w-10 h-10 text-rose-400 mb-2" />
                <span className="text-xs font-bold">Help Requests</span>
             </div>
             <div className="bg-white/5 rounded-3xl p-6 border border-white/10 w-48 h-48 flex flex-col justify-center items-center -mt-8">
                <Zap className="w-10 h-10 text-emerald-400 mb-2" />
                <span className="text-xs font-bold">Clean-ups</span>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 blur-[100px] -mr-48 -mt-48" />
      </div>
    </div>
  )
}
