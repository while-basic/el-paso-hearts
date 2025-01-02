'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  UsersIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CreditCardIcon,
  BellIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'Content Moderation', href: '/admin/moderation', icon: ShieldCheckIcon },
  { name: 'Matches & Messages', href: '/admin/matches', icon: ChatBubbleLeftRightIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCardIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  { name: 'Support', href: '/admin/support', icon: QuestionMarkCircleIcon },
  { name: 'Admin Roles', href: '/admin/roles', icon: UserGroupIcon },
  { name: 'Advertising', href: '/admin/advertising', icon: MegaphoneIcon },
  { name: 'Audit Logs', href: '/admin/audit', icon: ClipboardDocumentListIcon },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-white">El Paso Hearts Admin</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="fixed inset-0 z-40 flex">
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setSidebarOpen(false)}
          />

          <div
            className={`relative flex w-full max-w-xs flex-1 flex-col bg-gray-800 pt-5 pb-4 transform transition ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between px-4">
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={`mr-4 h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                        }`}
                      />
                      {item.name}
                    </Link>
                  )
                })}

                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <ArrowRightOnRectangleIcon className="mr-4 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 bg-gray-100 pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 