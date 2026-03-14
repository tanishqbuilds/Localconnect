'use client'

import { useState } from 'react'
import { adminLogin } from '@/app/actions/admin'
import toast from 'react-hot-toast'
import { Shield, Lock, Mail } from 'lucide-react'

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await adminLogin(formData)
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">LocalConnect</h1>
          <p className="text-slate-400 text-sm mt-1">Admin Control Panel</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h2 className="text-lg font-semibold text-white mb-6 text-center">
            Administrator Sign In
          </h2>

          <form className="space-y-5" action={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="admin@localconnect.gov"
                  className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 bg-white/5 text-white placeholder:text-slate-500 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 bg-white/5 text-white placeholder:text-slate-500 ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-primary-500 sm:text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:from-primary-500 hover:to-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-50 transition-all duration-300"
            >
              <Shield className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500">
              This portal is restricted to authorized administrators only.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          &copy; {new Date().getFullYear()} LocalConnect Admin
        </p>
      </div>
    </div>
  )
}
