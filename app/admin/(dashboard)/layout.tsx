import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, LayoutDashboard, Users, LogOut, MapPin } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  // Verify admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (userData?.role !== 'admin') redirect('/admin/login')

  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased">
        <div className="flex h-full">
          {/* Sidebar */}
          <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0">
            <div className="flex flex-col flex-grow bg-slate-900 overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-xl shadow-lg shadow-primary-500/20">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-white tracking-tight">LocalConnect</span>
                  <span className="block text-xs text-slate-400 -mt-0.5">Admin Panel</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-1">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <LayoutDashboard className="w-5 h-5 text-slate-400 group-hover:text-primary-400 transition-colors" />
                  Overview
                </Link>
                <Link
                  href="/admin/officers"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <Users className="w-5 h-5 text-slate-400 group-hover:text-primary-400 transition-colors" />
                  Officer Approval
                </Link>
              </nav>

              {/* User footer */}
              <div className="px-4 py-4 border-t border-slate-700/50">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                    {user.user_metadata?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.user_metadata?.name || 'Admin'}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <form action="/api/auth/signout" method="post" className="mt-2">
                  <Link
                    href="/admin/login"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Link>
                </form>
              </div>
            </div>
          </aside>

          {/* Mobile header */}
          <div className="lg:hidden fixed top-0 inset-x-0 bg-slate-900 z-50 px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-400" />
              <span className="font-bold text-white">Admin Panel</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-slate-300 hover:text-white text-sm">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              <Link href="/admin/officers" className="text-slate-300 hover:text-white text-sm">
                <Users className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 lg:pl-72">
            <div className="pt-16 lg:pt-0">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
