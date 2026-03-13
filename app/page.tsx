import Link from 'next/link'
import { ArrowRight, MessageSquare, ShieldCheck, MapPin } from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate pt-14 overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-primary-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
        </div>
        <div className="py-24 sm:py-32 lg:pb-40 animate-fade-in relative z-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="mx-auto max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl animate-[fade-in_1s_ease-out]">
                Improving our community, <span className="text-primary-600">together.</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600 animate-[fade-in_1.5s_ease-out]">
                LocalConnect easily connects citizens with local officers to report civic issues, track real-time resolution progress, and engage in meaningful community discussions.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 animate-[fade-in_2s_ease-out]">
                <Link
                  href="/signup"
                  className="rounded-md bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all hover:-translate-y-1 hover:shadow-primary-500/50"
                >
                  Join the platform <ArrowRight className="inline-block w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/login" className="text-sm font-semibold leading-6 text-slate-900 border border-slate-200 px-5 py-3 rounded-md hover:bg-slate-50 transition-colors">
                  Log in <span aria-hidden="true" className="ml-1 transition-transform hover:translate-x-1 inline-block">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-24 bg-slate-50 sm:py-32 relative z-20 border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600 tracking-wide uppercase">Empowering Citizens</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to improve your locality
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              <div className="relative pl-16 group p-6 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md">
                    <MapPin className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  Report Issues Geo-tagged
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">Instantly report problems like potholes, water leaks, or streetlights out, accurately pinned to your physical coordinate locations.</dd>
              </div>
              <div className="relative pl-16 group p-6 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 shadow-md">
                    <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  Direct Officer Resolution
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">Verified authorities view, prioritize, and update the status of complaints to resolved, adding real-time accountability trackers.</dd>
              </div>
              <div className="relative pl-16 group p-6 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <dt className="text-base font-semibold leading-7 text-slate-900">
                  <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-md">
                    <MessageSquare className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  Community Feed
                </dt>
                <dd className="mt-2 text-base leading-7 text-slate-600">Engage openly with neighbors through social posts, fast likes, and threaded comments to build a robust local community.</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
