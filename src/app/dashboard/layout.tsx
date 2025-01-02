'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  Cog6ToothIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartIconSolid,
  ChatBubbleLeftIcon as ChatIconSolid,
  UserIcon as UserIconSolid,
  Cog6ToothIcon as CogIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Discover',
      href: '/dashboard',
      icon: FireIcon,
      activeIcon: FireIconSolid,
      exact: true
    },
    {
      name: 'Liked',
      href: '/dashboard/liked',
      icon: HeartIcon,
      activeIcon: HeartIconSolid
    },
    {
      name: 'Messages',
      href: '/dashboard/messages',
      icon: ChatBubbleLeftIcon,
      activeIcon: ChatIconSolid
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      activeIcon: UserIconSolid
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Cog6ToothIcon,
      activeIcon: CogIconSolid
    }
  ]

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10 md:pl-64">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-purple-600 md:hidden">El Paso Hearts</span>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-purple-600">El Paso Hearts</h1>
        </div>
        <div className="mt-6">
          {navigation.map((item) => {
            const active = isActive(item.href, item.exact)
            const Icon = active ? item.activeIcon : item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  active
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around">
          {navigation.map((item) => {
            const active = isActive(item.href, item.exact)
            const Icon = active ? item.activeIcon : item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 text-xs ${
                  active ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-64 pt-16 min-h-screen pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
} 