'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  UsersIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalUsers: number
  totalMatches: number
  activeChats: number
  reportedContent: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMatches: 0,
    activeChats: 0,
    reportedContent: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch total matches
      const { count: matchCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'matched')

      // For now, set some mock data for other stats
      setStats({
        totalUsers: userCount || 0,
        totalMatches: matchCount || 0,
        activeChats: 0, // To be implemented
        reportedContent: 0 // To be implemented
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats_display = [
    { name: 'Total Users', value: stats.totalUsers, icon: UsersIcon },
    { name: 'Total Matches', value: stats.totalMatches, icon: HeartIcon },
    { name: 'Active Chats', value: stats.activeChats, icon: ChatBubbleLeftRightIcon },
    { name: 'Reported Content', value: stats.reportedContent, icon: ExclamationTriangleIcon }
  ]

  if (loading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="bg-gray-200 h-8 w-24 mb-4 rounded"></div>
                <div className="bg-gray-200 h-6 w-16 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats_display.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <h2 className="mt-8 text-lg font-medium text-gray-900">Recent Activity</h2>
      <div className="mt-4 bg-white shadow rounded-lg">
        <div className="p-6">
          <p className="text-gray-500 text-sm">No recent activity to display.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="mt-8 text-lg font-medium text-gray-900">Quick Actions</h2>
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
          Review Reported Content
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
          Manage User Verifications
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
          Send Announcement
        </button>
      </div>
    </div>
  )
} 