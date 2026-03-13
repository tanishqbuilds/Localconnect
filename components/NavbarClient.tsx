'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { LogOut, Menu, UserCircle, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NavbarClient({ user, role }: { user: any, role: string | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm transition-all relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
             <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="bg-primary-600 text-white p-2 rounded-lg group-hover:bg-primary-500 transition-colors shadow-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">LocalConnect</span>
             </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
             {user && (
               <>
                 <Link href={`/dashboard/${role}`} className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all hover:-translate-y-0.5">
                   Dashboard
                 </Link>
                 <Link href="/feed" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all hover:-translate-y-0.5">
                   Community Feed
                 </Link>
                 {role === 'citizen' && (
                   <Link href="/create-complaint" className="text-slate-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all hover:-translate-y-0.5">
                     Report Issue
                   </Link>
                 )}
               </>
             )}

            <div className="flex items-center space-x-4 border-l pl-4 border-slate-200">
              {user ? (
                <>
                  <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary-600 transition-all hover:-translate-y-0.5">
                    <UserCircle className="w-5 h-5" />
                    <span>{user.user_metadata?.name || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer p-2 rounded-md hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 cursor-pointer transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 shadow-lg absolute w-full bg-white z-50 animate-fade-in pb-4">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link href={`/dashboard/${role}`} className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 border-l-4 border-transparent hover:border-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/feed" className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 border-l-4 border-transparent hover:border-primary-600 transition-colors">
                  Community Feed
                </Link>
                {role === 'citizen' && (
                  <Link href="/create-complaint" className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 border-l-4 border-transparent hover:border-primary-600 transition-colors">
                    Report Issue
                  </Link>
                )}
                <Link href="/profile" className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-600 border-l-4 border-transparent hover:border-primary-600 transition-colors">
                  Profile
                </Link>
                <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 border-l-4 border-transparent hover:border-red-600 transition-colors cursor-pointer">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 border-l-4 border-transparent hover:border-slate-300 transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="block px-4 py-2 text-base font-medium text-primary-600 hover:bg-primary-50 border-l-4 border-transparent hover:border-primary-600 transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
