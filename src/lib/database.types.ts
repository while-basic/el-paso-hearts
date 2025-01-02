export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      matches: {
        Row: {
          id: string
          user_id: string
          matched_user_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          matched_user_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          matched_user_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
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
          languages: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          birthdate?: string
          gender?: string
          bio?: string
          interests?: string[]
          location?: string
          avatar_url?: string
          occupation?: string
          education?: string
          looking_for?: string[]
          height?: string
          languages?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          birthdate?: string
          gender?: string
          bio?: string
          interests?: string[]
          location?: string
          avatar_url?: string
          occupation?: string
          education?: string
          looking_for?: string[]
          height?: string
          languages?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_potential_matches: {
        Args: { user_id: string }
        Returns: {
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
          languages: string[]
          match_score: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 