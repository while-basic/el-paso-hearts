'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import {
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ReportedContent {
  id: string
  reported_user_id: string
  reporter_id: string
  reason: string
  content_type: 'profile' | 'message'
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reported_user?: {
    full_name: string
    avatar_url: string
  }
  reporter?: {
    full_name: string
  }
}

export default function ContentModeration() {
  const [reports, setReports] = useState<ReportedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reported_content')
        .select(`
          *,
          reported_user:reported_user_id(full_name, avatar_url),
          reporter:reporter_id(full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      const { error } = await supabase
        .from('reported_content')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', reportId)

      if (error) throw error

      setReports(reports.map(report =>
        report.id === reportId
          ? { ...report, status: action === 'approve' ? 'approved' : 'rejected' }
          : report
      ))
    } catch (error) {
      console.error('Error moderating content:', error)
    }
  }

  const filteredReports = reports.filter(report =>
    filter === 'all' ? true : report.status === filter
  )

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Content Moderation</h1>
          <p className="mt-2 text-sm text-gray-700">
            Review and moderate reported content and profiles.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-4">
        <div className="sm:flex sm:items-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'pending'
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'approved'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              filter === 'rejected'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Reports */}
      <div className="mt-8 space-y-6">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'pending'
                ? 'No content needs moderation at this time.'
                : 'No reports match the selected filter.'}
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {report.reported_user?.avatar_url && (
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <Image
                          src={report.reported_user.avatar_url}
                          alt={report.reported_user.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {report.reported_user?.full_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Reported by {report.reporter?.full_name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      report.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-900 font-medium">Reason:</div>
                  <p className="mt-1 text-sm text-gray-600">{report.reason}</p>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-900 font-medium">Reported Content:</div>
                  <p className="mt-1 text-sm text-gray-600">{report.content}</p>
                </div>

                {report.status === 'pending' && (
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => handleModeration(report.id, 'reject')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleModeration(report.id, 'approve')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                    >
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 