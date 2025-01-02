'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface OnboardingData {
  id?: string
  full_name: string
  birthdate: string
  gender: string
  bio: string
  interests: string[]
  location: string
  languages: string[]
  created_at?: string
  updated_at?: string
}

const INTERESTS = [
  'Music', 'Movies', 'Sports', 'Travel', 'Food', 'Art',
  'Reading', 'Gaming', 'Fitness', 'Photography', 'Dancing',
  'Hiking', 'Cooking', 'Technology', 'Fashion'
]

const LANGUAGES = ['English', 'Spanish']

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<OnboardingData>({
    full_name: '',
    birthdate: '',
    gender: '',
    bio: '',
    location: 'El Paso, TX',
    interests: [],
    languages: []
  })

  const handleNext = () => {
    if (!validateCurrentStep()) return
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const validateCurrentStep = (): boolean => {
    setError(null)
    switch (step) {
      case 1:
        if (!data.full_name.trim()) {
          setError('Please enter your name')
          return false
        }
        break
      case 2:
        if (!data.birthdate) {
          setError('Please enter your birthdate')
          return false
        }
        // Check if user is at least 18 years old
        const age = calculateAge(data.birthdate)
        if (age < 18) {
          setError('You must be at least 18 years old to use this service')
          return false
        }
        break
      case 3:
        if (!data.gender) {
          setError('Please select your gender')
          return false
        }
        break
      case 4:
        if (data.interests.length === 0) {
          setError('Please select at least one interest')
          return false
        }
        break
      case 5:
        if (data.languages.length === 0) {
          setError('Please select at least one language')
          return false
        }
        break
    }
    return true
  }

  const calculateAge = (birthdate: string): number => {
    const today = new Date()
    const birth = new Date(birthdate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return
    
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }
      if (!user) throw new Error('No user found')

      // Format the data
      const now = new Date().toISOString()
      const profileData = {
        id: user.id,
        full_name: data.full_name.trim(),
        birthdate: new Date(data.birthdate).toISOString().split('T')[0],
        gender: data.gender,
        bio: data.bio || '',
        interests: data.interests,
        languages: data.languages,
        location: data.location,
        created_at: now,
        updated_at: now
      }

      console.log('Attempting to save profile:', profileData)

      // First, try to delete any existing profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (deleteError && deleteError.code !== 'PGRST116') {
        console.error('Error deleting existing profile:', deleteError)
        throw deleteError
      }

      // Then create the new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])

      if (insertError) {
        console.error('Error inserting profile:', insertError)
        throw insertError
      }

      // Verify the profile was created
      const { data: newProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (verifyError) {
        console.error('Error verifying profile creation:', verifyError)
        throw verifyError
      }

      if (!newProfile) {
        throw new Error('Profile was not created successfully')
      }

      console.log('Profile created successfully:', newProfile)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      if (error instanceof Error) {
        setError(`Failed to save profile: ${error.message}`)
      } else {
        setError('Failed to save profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">
            Step {step} of 5
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Welcome! Let&apos;s get started</h2>
              <p className="text-gray-600">First, what&apos;s your name?</p>
              <input
                type="text"
                value={data.full_name}
                onChange={e => setData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">When&apos;s your birthday?</h2>
              <p className="text-gray-600">You must be at least 18 years old</p>
              <input
                type="date"
                value={data.birthdate}
                onChange={e => setData(prev => ({ ...prev, birthdate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">How do you identify?</h2>
              <p className="text-gray-600">Select your gender</p>
              <select
                value={data.gender}
                onChange={e => setData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">What are your interests?</h2>
              <p className="text-gray-600">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => setData(prev => ({
                      ...prev,
                      interests: prev.interests.includes(interest)
                        ? prev.interests.filter(i => i !== interest)
                        : [...prev.interests, interest]
                    }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      data.interests.includes(interest)
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">What languages do you speak?</h2>
              <p className="text-gray-600">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(language => (
                  <button
                    key={language}
                    onClick={() => setData(prev => ({
                      ...prev,
                      languages: prev.languages.includes(language)
                        ? prev.languages.filter(l => l !== language)
                        : [...prev.languages, language]
                    }))}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      data.languages.includes(language)
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back
              </button>
            )}
            <button
              onClick={step === 5 ? handleSubmit : handleNext}
              disabled={loading}
              className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : step === 5 ? 'Finish' : 'Next'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 