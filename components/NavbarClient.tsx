'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { LogOut, Menu, UserCircle, MapPin, Shield, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ActiveLink from './ActiveLink'

const NAV_BASE = 'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 active:scale-95 active:opacity-70'
const NAV_DEFAULT = `${NAV_BASE} text-slate-600 hover:text-primary-600 hover:bg-primary-50`
const NAV_ACTIVE = `${NAV_BASE} text-primary-700 bg-primary-50 font-semibold`

const MOB_BASE = 'block px-4 py-3 text-base font-medium border-l-4 transition-all duration-100 active:opacity-60 active:bg-primary-100'
const MOB_DEFAULT = `${MOB_BASE} text-slate-700 hover:bg-primary-50 hover:text-primary-600 border-transparent hover:border-primary-600`
const MOB_ACTIVE = `${MOB_BASE} text-primary-700 bg-primary-50 border-primary-600`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function NavbarClient({ user, role, reputation }: { user: any; role: string | null; reputation: number }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo */}
          <div className="flex items-center">
            <ActiveLink
              href="/"
              exact
              className="flex-shrink-0 flex items-center gap-2 group select-none"
            >
              <div className="bg-primary-600 text-white p-2 rounded-lg group-hover:bg-primary-500 group-active:scale-90 transition-all shadow-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">
                LocalConnect
              </span>
            </ActiveLink>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex sm:items-center sm:gap-1 ml-6">
            {user && (
              <>
                <ActiveLink
                  href={`/dashboard/${role}`}
                  className={isActive(`/dashboard/${role}`) ? NAV_ACTIVE : NAV_DEFAULT}
                >
                  Dashboard
                </ActiveLink>
                <ActiveLink
                  href="/explore"
                  className={isActive('/explore') ? NAV_ACTIVE : NAV_DEFAULT}
                >
                  Explore Hub
                </ActiveLink>
                <ActiveLink
                  href="/feed"
                  className={isActive('/feed') ? NAV_ACTIVE : NAV_DEFAULT}
                >
                  News Feed
                </ActiveLink>
                <ActiveLink
                  href="/officers"
                  className={`${isActive('/officers') ? NAV_ACTIVE : NAV_DEFAULT} flex items-center gap-1`}
                >
                  <Shield className="w-3.5 h-3.5" /> Officers
                </ActiveLink>
                {role === 'citizen' && (
                  <ActiveLink
                    href="/create-complaint"
                    className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 active:scale-95 active:shadow-none transition-all"
                  >
                    + Report Issue
                  </ActiveLink>
                )}
              </>
            )}

            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
              {user ? (
                <>
                  {/* Professional Reputation Badge */}
                  <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full mr-2">
                    <div className="bg-amber-100 p-1 rounded-full">
                       <Shield className="w-3 h-3 text-amber-600 fill-amber-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{reputation} CP</span>
                  </div>

                  <ActiveLink
                    href="/profile"
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    <UserCircle className="w-5 h-5" />
                    <span className="hidden md:block">{user.user_metadata?.name?.split(' ')[0] || 'Profile'}</span>
                  </ActiveLink>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 active:scale-95 active:opacity-70 transition-all disabled:opacity-40"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:block">{signingOut ? 'Signing out...' : 'Sign out'}</span>
                  </button>
                </>
              ) : (
                <>
                  <ActiveLink
                    href="/login"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    Log in
                  </ActiveLink>
                  <ActiveLink
                    href="/signup"
                    className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 active:scale-95 active:shadow-none transition-all"
                  >
                    Sign up
                  </ActiveLink>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:scale-90 active:bg-slate-200 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 absolute w-full bg-white z-50 shadow-xl animate-fade-in pb-3">
          <div className="pt-1 space-y-0.5 px-2">
            {user ? (
              <>
                <ActiveLink href={`/dashboard/${role}`} className={isActive(`/dashboard/${role}`) ? MOB_ACTIVE : MOB_DEFAULT} onClick={closeMobileMenu}>
                  Dashboard
                </ActiveLink>
                <ActiveLink href="/explore" className={isActive('/explore') ? MOB_ACTIVE : MOB_DEFAULT} onClick={closeMobileMenu}>
                  Explore Hub
                </ActiveLink>
                <ActiveLink href="/feed" className={isActive('/feed') ? MOB_ACTIVE : MOB_DEFAULT} onClick={closeMobileMenu}>
                  Community Feed
                </ActiveLink>
                <ActiveLink href="/officers" className={isActive('/officers') ? MOB_ACTIVE : MOB_DEFAULT} onClick={closeMobileMenu}>
                  Officers Directory
                </ActiveLink>
                {role === 'citizen' && (
                  <ActiveLink href="/create-complaint" className={isActive('/create-complaint') ? MOB_ACTIVE : MOB_DEFAULT} onClick={closeMobileMenu}>
                    Report Issue
                  </ActiveLink>
                )}
                <ActiveLink href="/profile" className={isActive('/profile') ? MOB_ACTIVE : MOB_DEFAULT} onClick={closeMobileMenu}>
                  Profile
                </ActiveLink>
                <button
                  onClick={() => { closeMobileMenu(); handleSignOut() }}
                  disabled={signingOut}
                  className="w-full text-left block px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 border-l-4 border-transparent hover:border-red-600 active:bg-red-100 transition-all"
                >
                  {signingOut ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <ActiveLink href="/login" className={MOB_DEFAULT} onClick={closeMobileMenu}>
                  Log in
                </ActiveLink>
                <ActiveLink href="/signup" className={MOB_DEFAULT} onClick={closeMobileMenu}>
                  Sign up
                </ActiveLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
