'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import {
  ChatBubbleLeftRightIcon,
  HeartIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline'

interface Match {
  id: string
  user_id: string
  matched_user_id: string
  status: string
  created_at: string
  user: {
    full_name: string
    avatar_url: string
  }
  matched_user: {
    full_name: string
    avatar_url: string
  }
  messages_count: number
}

interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  created_at: string
  sender: {
    full_name: string
    avatar_url: string
  }
}

export default function MatchesMonitoring() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          user:user_id(full_name, avatar_url),
          matched_user:matched_user_id(full_name, avatar_url),
          messages_count:messages(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setMatches(data || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (matchId: string) => {
    setLoadingMessages(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(full_name, avatar_url)
        `)
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleUnmatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to unmatch these users?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'unmatched' })
        .eq('id', matchId)

      if (error) throw error

      setMatches(matches.map(match =>
        match.id === matchId ? { ...match, status: 'unmatched' } : match
      ))
      setSelectedMatch(null)
      setMessages([])
    } catch (error) {
      console.error('Error unmatching users:', error)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Matches & Messages</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor user matches and their conversations.
          </p>
        </div>
      </div>

      <div className="mt-8 flex space-x-8">
        {/* Matches List */}
        <div className="w-1/2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Matches</h2>
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className={`bg-white shadow rounded-lg overflow-hidden cursor-pointer transition ${
                  selectedMatch?.id === match.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => {
                  setSelectedMatch(match)
                  fetchMessages(match.id)
                }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white">
                          <Image
                            src={match.user.avatar_url || '/default-avatar.png'}
                            alt={match.user.full_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white">
                          <Image
                            src={match.matched_user.avatar_url || '/default-avatar.png'}
                            alt={match.matched_user.full_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {match.user.full_name} & {match.matched_user.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(match.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                        {match.messages_count}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          match.status === 'matched'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {match.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="w-1/2">
          {selectedMatch ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white">
                        <Image
                          src={selectedMatch.user.avatar_url || '/default-avatar.png'}
                          alt={selectedMatch.user.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white">
                        <Image
                          src={selectedMatch.matched_user.avatar_url || '/default-avatar.png'}
                          alt={selectedMatch.matched_user.full_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedMatch.user.full_name} & {selectedMatch.matched_user.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Matched on {new Date(selectedMatch.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnmatch(selectedMatch.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    <NoSymbolIcon className="h-5 w-5 mr-2" />
                    Unmatch
                  </button>
                </div>
              </div>

              <div className="p-4">
                {loadingMessages ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This match hasn&apos;t started a conversation yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={message.sender.avatar_url || '/default-avatar.png'}
                            alt={message.sender.full_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {message.sender.full_name}
                          </div>
                          <div className="mt-1 text-sm text-gray-700">
                            {message.content}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No match selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a match to view their conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 