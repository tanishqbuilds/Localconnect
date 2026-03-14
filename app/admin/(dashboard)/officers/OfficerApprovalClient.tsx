'use client'

import { useState } from 'react'
import { approveOfficer, rejectOfficer } from '@/app/actions/admin'
import toast from 'react-hot-toast'
import { UserCheck, UserX, Shield, CheckCircle, Clock, Search, BadgeCheck, AlertTriangle, Eye, FileText, X } from 'lucide-react'

interface Officer {
  officer_id: string
  department: string
  designation: string
  is_approved: boolean
  created_at: string
  id_document_url?: string
  additional_document_url?: string
  user: {
    name: string
    email: string
    phone: string | null
  }
}

export default function OfficerApprovalClient({ officers: initialOfficers }: { officers: Officer[] }) {
  const [officers, setOfficers] = useState(initialOfficers)
  const [processing, setProcessing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [search, setSearch] = useState('')
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null)

  const handleApprove = async (officerId: string) => {
    setProcessing(officerId)
    const res = await approveOfficer(officerId)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Officer approved successfully!')
      setOfficers(prev => prev.map(o =>
        o.officer_id === officerId ? { ...o, is_approved: true } : o
      ))
      if (selectedOfficer?.officer_id === officerId) {
        setSelectedOfficer(prev => prev ? { ...prev, is_approved: true } : null)
      }
    }
    setProcessing(null)
  }

  const handleReject = async (officerId: string) => {
    if (!confirm('Are you sure you want to reject this officer? They will be converted back to a citizen.')) return
    setProcessing(officerId)
    const res = await rejectOfficer(officerId)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Officer rejected and converted to citizen.')
      setOfficers(prev => prev.filter(o => o.officer_id !== officerId))
      setSelectedOfficer(null)
    }
    setProcessing(null)
  }

  const filtered = officers.filter(o => {
    if (filter === 'pending' && o.is_approved) return false
    if (filter === 'approved' && !o.is_approved) return false
    if (search) {
      const q = search.toLowerCase()
      return o.user?.name?.toLowerCase().includes(q) ||
             o.user?.email?.toLowerCase().includes(q) ||
             o.department?.toLowerCase().includes(q)
    }
    return true
  })

  const pendingCount = officers.filter(o => !o.is_approved).length
  const approvedCount = officers.filter(o => o.is_approved).length

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary-600" />
          Officer Approval
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage officer registrations. Approve or reject officer applications after verifying their documents.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-slate-100 rounded-lg">
            <UserCheck className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Officers</p>
            <p className="text-2xl font-bold text-slate-900">{officers.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-amber-50 rounded-lg">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="p-2.5 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Approved Officers</p>
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              All ({officers.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Pending ({pendingCount})
              </span>
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'approved' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5" />
                Approved ({approvedCount})
              </span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search officers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block w-full sm:w-64 rounded-lg border-0 py-2 pl-10 pr-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="py-3 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Officer</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Department</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Designation</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Joined</th>
                <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((officer) => (
                <tr key={officer.officer_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0 ${
                        officer.is_approved ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}>
                        {officer.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{officer.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{officer.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600">{officer.department}</td>
                  <td className="px-3 py-4 text-sm text-slate-600">{officer.designation}</td>
                  <td className="px-3 py-4">
                    {officer.is_approved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-400">{new Date(officer.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-4 text-right pr-6">
                    <button
                      onClick={() => setSelectedOfficer(officer)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    {search ? 'No officers match your search.' : filter === 'pending' ? 'No officers pending approval.' : 'No officers found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officer Detail Modal */}
      {selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                Officer Verification
              </h2>
              <button 
                onClick={() => setSelectedOfficer(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-6 space-y-8">
              {/* Profile Info */}
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0 ${
                  selectedOfficer.is_approved ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                  {selectedOfficer.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedOfficer.user?.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                    <p>{selectedOfficer.user?.email}</p>
                    {selectedOfficer.user?.phone && <p>• {selectedOfficer.user?.phone}</p>}
                    <p>• Joined {new Date(selectedOfficer.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {selectedOfficer.department}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      {selectedOfficer.designation}
                    </span>
                    {selectedOfficer.is_approved ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Verification Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ID Document */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Government ID</p>
                    {selectedOfficer.id_document_url ? (
                      <a 
                        href={selectedOfficer.id_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative block w-full aspect-video bg-slate-50 rounded-lg overflow-hidden border border-slate-200 hover:border-primary-400 transition-colors"
                      >
                        {selectedOfficer.id_document_url.endsWith('.pdf') ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-600 bg-primary-50 group-hover:bg-primary-100 transition-colors">
                            <FileText className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">View PDF Document</span>
                          </div>
                        ) : (
                          <img 
                            src={selectedOfficer.id_document_url} 
                            alt="Government ID" 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </a>
                    ) : (
                      <div className="w-full aspect-video bg-slate-50 rounded-lg border border-slate-200 border-dashed flex items-center justify-center text-sm text-slate-400">
                        No ID uploaded
                      </div>
                    )}
                  </div>

                  {/* Additional Document */}
                  <div className="border border-slate-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Additional Document</p>
                    {selectedOfficer.additional_document_url ? (
                      <a 
                        href={selectedOfficer.additional_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative block w-full aspect-video bg-slate-50 rounded-lg overflow-hidden border border-slate-200 hover:border-primary-400 transition-colors"
                      >
                        {selectedOfficer.additional_document_url.endsWith('.pdf') ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-600 bg-primary-50 group-hover:bg-primary-100 transition-colors">
                            <FileText className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">View PDF Document</span>
                          </div>
                        ) : (
                          <img 
                            src={selectedOfficer.additional_document_url} 
                            alt="Additional Document" 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </a>
                    ) : (
                      <div className="w-full aspect-video bg-slate-50 rounded-lg border border-slate-200 border-dashed flex items-center justify-center text-sm text-slate-400">
                        Not provided
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setSelectedOfficer(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50"
              >
                Close
              </button>
              
              {!selectedOfficer.is_approved && (
                <>
                  <button
                    onClick={() => handleReject(selectedOfficer.officer_id)}
                    disabled={processing === selectedOfficer.officer_id}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-500 disabled:opacity-50"
                  >
                    <UserX className="w-4 h-4" />
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleApprove(selectedOfficer.officer_id)}
                    disabled={processing === selectedOfficer.officer_id}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-500 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve Officer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
