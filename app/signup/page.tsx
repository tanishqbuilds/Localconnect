'use client'

import { useState } from 'react'
import { signup } from '@/app/actions/auth'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<'citizen' | 'officer'>('citizen')

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const res = await signup(formData)
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Registration successful. You can log in now.')
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-slate-900">
          Create an account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 shadow rounded-lg border border-gray-100">
        <form className="space-y-6" action={handleSubmit}>
          
          <div className="flex gap-4 mb-6">
            <label className={`flex-1 cursor-pointer rounded-lg border p-4 text-center transition-all ${role === 'citizen' ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="role" value="citizen" className="sr-only" onChange={() => setRole('citizen')} checked={role === 'citizen'} />
              <span className="block text-sm font-medium text-slate-900">Citizen</span>
            </label>
            <label className={`flex-1 cursor-pointer rounded-lg border p-4 text-center transition-all ${role === 'officer' ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-600' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="role" value="officer" className="sr-only" onChange={() => setRole('officer')} checked={role === 'officer'} />
              <span className="block text-sm font-medium text-slate-900">Officer</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">Full Name</label>
            <div className="mt-2">
              <input name="name" type="text" required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">Email address</label>
            <div className="mt-2">
              <input name="email" type="email" required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">Phone</label>
            <div className="mt-2">
              <input name="phone" type="text" className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          {role === 'officer' && (
             <>
               <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Department</label>
                  <div className="mt-2">
                    <input name="department" type="text" required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Designation</label>
                  <div className="mt-2">
                    <input name="designation" type="text" required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                </div>
             </>
          )}

          <div>
            <label className="block text-sm font-medium leading-6 text-slate-900">Password</label>
            <div className="mt-2">
              <input name="password" type="password" required className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 px-3" />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-primary-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already a member?{' '}
          <Link href="/login" className="font-semibold leading-6 text-primary-600 hover:text-primary-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
