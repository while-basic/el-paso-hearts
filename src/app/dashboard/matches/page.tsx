'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

interface Match {
  id: string
  profile: {
    id: string
    full_name: string
    avatar_url?: string
    bio: string
  }
  created_at: string
  last_message?: string
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // TODO: Implement actual matches query when matches table is created
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio')
        .neq('id', user.id)
        .limit(5)

      if (error) throw error

      // Temporary mock data structure
      const mockMatches = data.map(profile => ({
        id: `match_${profile.id}`,
        profile,
        created_at: new Date().toISOString(),
      }))

      setMatches(mockMatches)
    } catch (error) {
      console.error('Error fetching matches:', error)
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-900">No matches yet</h2>
        <p className="mt-2 text-gray-600">Keep swiping to find your perfect match!</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Matches</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="flex items-center p-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={match.profile.avatar_url || "https://images.unsplash.com/photo-1517841905240-472988babdf9"}
                  alt={match.profile.full_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {match.profile.full_name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {match.profile.bio}
                </p>
              </div>
              <Link
                href={`/dashboard/messages/${match.profile.id}`}
                className="ml-4 p-2 text-purple-600 hover:text-purple-700 rounded-full hover:bg-purple-50"
              >
                <ChatBubbleLeftIcon className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 