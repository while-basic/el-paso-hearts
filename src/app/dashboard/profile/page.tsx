'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import {
  CameraIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface Profile {
  id: string
  full_name: string
  birthdate: string
  gender: string
  bio: string
  interests: string[]
  location: string
  avatar_url?: string
  occupation?: string
  education?: string
  looking_for?: string[]
  height?: string
  languages?: string[]
}

const INTERESTS = [
  'Music', 'Movies', 'Sports', 'Travel', 'Food', 'Art',
  'Reading', 'Gaming', 'Fitness', 'Photography', 'Dancing',
  'Hiking', 'Cooking', 'Technology', 'Fashion'
]

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Arabic']

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [age, setAge] = useState<number | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile) {
      setSelectedInterests(profile.interests || [])
      setSelectedLanguages(profile.languages || [])
      if (profile.birthdate) {
        const calculatedAge = calculateAge(profile.birthdate)
        setAge(calculatedAge)
      }
    }
  }, [profile])

  const calculateAge = (birthdate: string) => {
    try {
      const today = new Date()
      const birth = new Date(birthdate)
      let calculatedAge = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--
      }
      return calculatedAge
    } catch (error) {
      console.error('Error calculating age:', error)
      return null
    }
  }

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        setError('Authentication failed. Please sign in again.')
        return
      }

      if (!user) {
        setError('No user found. Please sign in.')
        return
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                full_name: user.user_metadata?.full_name || '',
                location: 'El Paso, TX',
                interests: [],
                languages: [],
              }
            ])
            .select()
            .single()

          if (insertError) {
            console.error('Error creating profile:', insertError)
            setError('Failed to create profile')
            return
          }

          // Fetch the newly created profile
          const { data: newProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (fetchError) {
            console.error('Error fetching new profile:', fetchError)
            setError('Failed to load profile')
            return
          }

          setProfile(newProfile)
        } else {
          console.error('Error fetching profile:', profileError)
          setError('Failed to load profile')
        }
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          interests: selectedInterests,
          languages: selectedLanguages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      setEditMode(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    if (!profile) return

    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.id}.${fileExt}`

    try {
      setLoading(true)
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image')
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

  if (!profile) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
        <p className="mt-2 text-gray-600">Please try again later</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {error && (
        <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Header Section */}
      <div className="relative mb-8">
        <div className="absolute right-4 top-4 z-10">
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {editMode ? (
              <>
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500" />

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden">
                  <Image
                    src={profile.avatar_url || "https://images.unsplash.com/photo-1517841905240-472988babdf9"}
                    alt={profile.full_name}
                    fill
                    className="object-cover"
                  />
                </div>
                {editMode && (
                  <label className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white cursor-pointer hover:bg-purple-700">
                    <CameraIcon className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={loading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="ml-40 pt-4">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {editMode ? (
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={e => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                      className="px-2 py-1 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    profile.full_name
                  )}
                </h1>
                <span className="text-gray-500">
                  {age !== null && `${age} years`}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <MapPinIcon className="w-5 h-5" />
                {profile.location}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About Me</h2>
            {editMode ? (
              <textarea
                value={profile.bio}
                onChange={e => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700">{profile.bio}</p>
            )}
          </motion.div>

          {/* Basic Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                {editMode ? (
                  <select
                    value={profile.gender}
                    onChange={e => setProfile(prev => prev ? { ...prev, gender: e.target.value } : null)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900 capitalize">{profile.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Occupation</label>
                {editMode ? (
                  <input
                    type="text"
                    value={profile.occupation || ''}
                    onChange={e => setProfile(prev => prev ? { ...prev, occupation: e.target.value } : null)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile.occupation || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Education</label>
                {editMode ? (
                  <input
                    type="text"
                    value={profile.education || ''}
                    onChange={e => setProfile(prev => prev ? { ...prev, education: e.target.value } : null)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile.education || 'Not specified'}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Interests Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => editMode && setSelectedInterests(prev =>
                    prev.includes(interest)
                      ? prev.filter(i => i !== interest)
                      : [...prev, interest]
                  )}
                  disabled={!editMode}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  } ${editMode ? 'hover:bg-purple-50' : ''}`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Languages Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((language) => (
                <button
                  key={language}
                  onClick={() => editMode && setSelectedLanguages(prev =>
                    prev.includes(language)
                      ? prev.filter(l => l !== language)
                      : [...prev, language]
                  )}
                  disabled={!editMode}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedLanguages.includes(language)
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  } ${editMode ? 'hover:bg-purple-50' : ''}`}
                >
                  {language}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Save Button */}
      {editMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <CheckIcon className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>
      )}
    </div>
  )
} 