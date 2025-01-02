'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Conversation {
  id: string
  profile: {
    id: string
    full_name: string
    avatar_url?: string
  }
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // TODO: Implement actual conversations query when messages table is created
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .neq('id', user.id)
        .limit(10)

      if (error) throw error

      // Temporary mock data structure
      const mockConversations = data.map(profile => ({
        id: `conv_${profile.id}`,
        profile,
        last_message: 'Hey, how are you?',
        last_message_time: new Date().toISOString(),
        unread_count: Math.floor(Math.random() * 3),
      }))

      setConversations(mockConversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'long' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
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

  if (conversations.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-900">No messages yet</h2>
        <p className="mt-2 text-gray-600">Start a conversation with your matches!</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {conversations.map((conversation, index) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/dashboard/messages/${conversation.profile.id}`}
              className={`flex items-center p-4 hover:bg-gray-50 ${
                index !== conversations.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="relative">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={conversation.profile.avatar_url || "https://images.unsplash.com/photo-1517841905240-472988babdf9"}
                    alt={conversation.profile.full_name}
                    fill
                    className="object-cover"
                  />
                </div>
                {conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">{conversation.unread_count}</span>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {conversation.profile.full_name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatTime(conversation.last_message_time)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {conversation.last_message}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 