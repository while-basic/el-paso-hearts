'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

interface Profile {
  id: string
  full_name: string
  birthdate: string
  gender: string
  bio: string
  interests: string[]
  location: string
  avatar_url?: string
}

interface SwipeWithProfile {
  swiped_id: string
  created_at: string
  profiles: Profile
}

interface LikedProfile extends Profile {
  liked_at: string
  age: number
}

export default function LikedProfiles() {
  const [profiles, setProfiles] = useState<LikedProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLikedProfiles()
  }, [])

  const fetchLikedProfiles = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('swipes')
        .select(`
          swiped_id,
          created_at,
          profiles:swiped_id (
            id,
            full_name,
            birthdate,
            gender,
            bio,
            interests,
            location,
            avatar_url
          )
        `)
        .eq('swiper_id', user.id)
        .eq('action', 'like')
        .order('created_at', { ascending: false })

      if (error) throw error

      const likedProfiles = (data as unknown as SwipeWithProfile[]).map(swipe => ({
        ...swipe.profiles,
        liked_at: swipe.created_at,
        age: calculateAge(swipe.profiles.birthdate)
      }))

      setProfiles(likedProfiles)
    } catch (error) {
      console.error('Error fetching liked profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthdate: string) => {
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-900">No liked profiles yet</h2>
        <p className="mt-2 text-gray-600">Start swiping to find your matches!</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Liked Profiles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="relative h-48">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No photo</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">
                {profile.full_name}, {profile.age}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{profile.location}</p>
              {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {profile.interests.slice(0, 3).map(interest => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                  {profile.interests.length > 3 && (
                    <span className="px-2 py-1 text-gray-500 text-xs">
                      +{profile.interests.length - 3} more
                    </span>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Liked {new Date(profile.liked_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 