'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, PanInfo, useAnimation } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { HeartIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Profile {
  id: string
  full_name: string
  birthdate: string
  gender: string
  bio: string
  interests: string[]
  location: string
  avatar_url?: string
  age: number
}

export default function Dashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentProfile, setCurrentProfile] = useState(0)
  const [loading, setLoading] = useState(true)
  const controls = useAnimation()

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Authentication error:', authError)
        throw authError
      }
      if (!user) {
        console.error('No authenticated user found')
        throw new Error('No user found')
      }

      console.log('Fetching profiles for user:', user.id)
      const { data, error } = await supabase.rpc('get_potential_matches', {
        user_id: user.id
      })

      if (error) {
        console.error('Database error:', error.message, error.details, error.hint)
        throw error
      }

      if (!data) {
        console.log('No profiles found')
        setProfiles([])
        return
      }

      console.log('Fetched profiles:', data.length)
      setProfiles(data)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching profiles:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
      } else {
        console.error('Unknown error fetching profiles:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (profileId: string, action: 'like' | 'dislike') => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!user) throw new Error('No user found')

      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert([{
          swiper_id: user.id,
          swiped_id: profileId,
          action
        }])

      if (swipeError) throw swipeError

      // Check if it's a match
      if (action === 'like') {
        const { data: isMatch, error: matchError } = await supabase
          .rpc('check_match', {
            swiper: user.id,
            swiped: profileId
          })

        if (matchError) throw matchError

        if (isMatch) {
          // Show match notification
          alert("It's a match! 🎉")
        }
      }

      // Move to next profile
      setCurrentProfile(prev => prev + 1)
    } catch (error) {
      console.error('Error handling swipe:', error)
    }
  }

  const handleDragEnd = async (info: PanInfo, profileId: string) => {
    const threshold = 100
    const swipe = info.offset.x
    
    if (Math.abs(swipe) > threshold) {
      if (swipe > 0) {
        await handleSwipe(profileId, 'like')
      } else {
        await handleSwipe(profileId, 'dislike')
      }
    } else {
      controls.start({ x: 0 })
    }
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
        <h2 className="text-2xl font-bold text-gray-900">No more profiles</h2>
        <p className="mt-2 text-gray-600">Check back later for new potential matches!</p>
      </div>
    )
  }

  if (currentProfile >= profiles.length) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-900">That's all for now!</h2>
        <p className="mt-2 text-gray-600">Check back later for new potential matches!</p>
      </div>
    )
  }

  const profile = profiles[currentProfile]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        key={profile.id}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => handleDragEnd(info, profile.id)}
        animate={controls}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Profile Image */}
        <div className="relative h-96">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-lg">No photo</span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.full_name}, {profile.age}
              </h2>
              <p className="text-gray-600">{profile.location}</p>
            </div>
          </div>

          {profile.bio && (
            <p className="text-gray-700 mb-4">{profile.bio}</p>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.interests.map(interest => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => handleSwipe(profile.id, 'dislike')}
              className="p-4 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <button
              onClick={() => handleSwipe(profile.id, 'like')}
              className="p-4 rounded-full bg-green-100 text-green-500 hover:bg-green-200 transition-colors"
            >
              <HeartIcon className="w-8 h-8" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 