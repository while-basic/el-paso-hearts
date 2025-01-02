'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface SettingSection {
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  items: {
    label: string
    type: 'toggle' | 'select' | 'button'
    value?: boolean | string
    options?: string[]
    danger?: boolean
  }[]
}

export default function Settings() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    visibility: 'everyone',
    location: 'El Paso, TX',
    distance: '25',
  })

  const sections: SettingSection[] = [
    {
      title: 'Notifications',
      description: 'Manage how you want to be notified',
      icon: BellIcon,
      items: [
        {
          label: 'Email notifications',
          type: 'toggle',
          value: settings.emailNotifications,
        },
        {
          label: 'Push notifications',
          type: 'toggle',
          value: settings.pushNotifications,
        },
      ],
    },
    {
      title: 'Privacy',
      description: 'Control your profile visibility and data',
      icon: ShieldCheckIcon,
      items: [
        {
          label: 'Profile visibility',
          type: 'select',
          value: settings.visibility,
          options: ['everyone', 'matches only', 'hidden'],
        },
      ],
    },
    {
      title: 'Location',
      description: 'Set your location preferences',
      icon: GlobeAltIcon,
      items: [
        {
          label: 'Location',
          type: 'select',
          value: settings.location,
          options: ['El Paso, TX'],
        },
        {
          label: 'Maximum distance',
          type: 'select',
          value: settings.distance,
          options: ['5', '10', '25', '50', '100'],
        },
      ],
    },
    {
      title: 'Account',
      description: 'Manage your account settings',
      icon: UserIcon,
      items: [
        {
          label: 'Delete account',
          type: 'button',
          danger: true,
        },
      ],
    },
  ]

  const handleToggle = (section: string, label: string) => {
    setSettings(prev => ({
      ...prev,
      [section.toLowerCase() + label.replace(/\s+/g, '')]: !prev[section.toLowerCase() + label.replace(/\s+/g, '') as keyof typeof prev],
    }))
  }

  const handleSelect = (section: string, label: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section.toLowerCase() + label.replace(/\s+/g, '')]: value,
    }))
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // TODO: Implement account deletion logic
      router.push('/signup')
    } catch (error) {
      console.error('Error deleting account:', error)
      setError('Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {error && (
        <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    {item.type === 'toggle' && (
                      <button
                        onClick={() => handleToggle(section.title, item.label)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.value ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}
                    {item.type === 'select' && (
                      <select
                        value={item.value as string}
                        onChange={(e) => handleSelect(section.title, item.label, e.target.value)}
                        className="text-sm rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      >
                        {item.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {item.type === 'button' && item.danger && (
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4 inline-block mr-1" />
                        Delete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 