import { supabase } from './supabase'
import { Database } from './database.types'

export type PotentialMatch = Database['public']['Functions']['get_potential_matches']['Returns'][0]

type BaseMatch = Database['public']['Tables']['matches']['Row']

export interface Match extends Omit<BaseMatch, 'matched_user_id'> {
  matched_user_id: string
  profile: {
    full_name: string
    avatar_url?: string
    bio: string
  }
}

export async function getPotentialMatches(): Promise<PotentialMatch[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('No user found')

    const { data, error } = await supabase.rpc('get_potential_matches', {
      user_id: user.id
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting potential matches:', error)
    throw error
  }
}

export async function createMatch(matchedUserId: string): Promise<void> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('No user found')

    const { error } = await supabase
      .from('matches')
      .insert([
        {
          user_id: user.id,
          matched_user_id: matchedUserId,
          status: 'pending'
        }
      ])

    if (error) throw error
  } catch (error) {
    console.error('Error creating match:', error)
    throw error
  }
}

export async function updateMatchStatus(
  matchId: string,
  status: 'accepted' | 'rejected'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('matches')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', matchId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating match status:', error)
    throw error
  }
}

interface MatchWithProfile {
  id: string
  user_id: string
  matched_user_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  matched_profile: {
    full_name: string
    avatar_url?: string
    bio: string
  }
}

export async function getMatches(): Promise<Match[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('No user found')

    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        user_id,
        matched_user_id,
        status,
        created_at,
        updated_at,
        matched_profile:profiles!matches_matched_user_id_fkey(
          full_name,
          avatar_url,
          bio
        )
      `)
      .or(`user_id.eq.${user.id},matched_user_id.eq.${user.id}`)
      .eq('status', 'accepted')

    if (error) throw error

    return ((data || []) as unknown as MatchWithProfile[]).map(match => ({
      ...match,
      profile: match.matched_profile
    }))
  } catch (error) {
    console.error('Error getting matches:', error)
    throw error
  }
}

export async function checkMutualMatch(matchedUserId: string): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('No user found')

    const { data, error } = await supabase
      .from('matches')
      .select('status')
      .match({
        user_id: matchedUserId,
        matched_user_id: user.id,
        status: 'accepted'
      })

    if (error) throw error
    return data && data.length > 0
  } catch (error) {
    console.error('Error checking mutual match:', error)
    throw error
  }
} 