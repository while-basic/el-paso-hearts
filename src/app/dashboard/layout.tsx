'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { HomeIcon, UserIcon, ChatBubbleLeftIcon, HeartIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/signin')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/signin')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="El Paso Hearts Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="ml-2 text-xl font-semibold text-gray-900">El Paso Hearts</span>
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
        <div className="flex justify-around">
          <Link href="/dashboard" className="p-4">
            <HomeIcon className="w-6 h-6 text-purple-600" />
          </Link>
          <Link href="/dashboard/matches" className="p-4">
            <HeartIcon className="w-6 h-6 text-gray-400" />
          </Link>
          <Link href="/dashboard/messages" className="p-4">
            <ChatBubbleLeftIcon className="w-6 h-6 text-gray-400" />
          </Link>
          <Link href="/dashboard/profile" className="p-4">
            <UserIcon className="w-6 h-6 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Side Navigation (Desktop) */}
      <div className="hidden sm:flex">
        <div className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] fixed">
          <nav className="mt-8 space-y-2 px-4">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg"
            >
              <HomeIcon className="w-5 h-5 mr-3" />
              Home
            </Link>
            <Link
              href="/dashboard/matches"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg"
            >
              <HeartIcon className="w-5 h-5 mr-3" />
              Matches
            </Link>
            <Link
              href="/dashboard/messages"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg"
            >
              <ChatBubbleLeftIcon className="w-5 h-5 mr-3" />
              Messages
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg"
            >
              <UserIcon className="w-5 h-5 mr-3" />
              Profile
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-lg"
            >
              <Cog6ToothIcon className="w-5 h-5 mr-3" />
              Settings
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Mobile Content */}
      <main className="sm:hidden pb-20 p-4">
        {children}
      </main>
    </div>
  )
} 