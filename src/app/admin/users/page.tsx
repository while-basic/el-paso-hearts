'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  TrashIcon,
  NoSymbolIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  full_name: string
  email: string
  created_at: string
  last_sign_in_at: string
  banned: boolean
  verified: boolean
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profileError) throw profileError

      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) throw authError

      // Combine profile and auth data
      const combinedUsers = profiles.map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id)
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: authUser?.email || 'N/A',
          created_at: profile.created_at,
          last_sign_in_at: authUser?.last_sign_in_at || 'Never',
          banned: false, // To be implemented
          verified: profile.verified || false
        }
      })

      setUsers(combinedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: true })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, verified: true } : user
      ))
    } catch (error) {
      console.error('Error verifying user:', error)
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      // Instead of using the admin API, we'll update a custom claim
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { 
          app_metadata: { banned: true }
        }
      )

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, banned: true } : user
      ))
    } catch (error) {
      console.error('Error banning user:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error

      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all users in the platform including their name, email, and status.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
        />
      </div>

      {/* Users Table */}
      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Joined
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Sign In
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {user.full_name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {user.last_sign_in_at === 'Never' 
                          ? 'Never' 
                          : new Date(user.last_sign_in_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            user.banned
                              ? 'bg-red-100 text-red-800'
                              : user.verified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {user.banned ? 'Banned' : user.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          {!user.verified && (
                            <button
                              onClick={() => handleVerifyUser(user.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <NoSymbolIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 