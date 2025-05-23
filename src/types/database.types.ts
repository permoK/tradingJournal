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
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          streak_count: number
          last_active: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          streak_count?: number
          last_active?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          streak_count?: number
          last_active?: string | null
        }
      }
      learning_topics: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          category: string
          difficulty: string
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          category: string
          difficulty: string
          order: number
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          category?: string
          difficulty?: string
          order?: number
        }
      }
      user_progress: {
        Row: {
          id: string
          created_at: string
          user_id: string
          topic_id: string
          status: 'not_started' | 'in_progress' | 'completed'
          completion_date: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          topic_id: string
          status?: 'not_started' | 'in_progress' | 'completed'
          completion_date?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          topic_id?: string
          status?: 'not_started' | 'in_progress' | 'completed'
          completion_date?: string | null
          notes?: string | null
        }
      }
      journal_entries: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          content: string
          is_private: boolean
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          content: string
          is_private?: boolean
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          content?: string
          is_private?: boolean
          tags?: string[] | null
        }
      }
      trades: {
        Row: {
          id: string
          created_at: string
          user_id: string
          trade_date: string
          market: string
          trade_type: string
          entry_price: number
          exit_price: number | null
          quantity: number
          profit_loss: number | null
          status: 'open' | 'closed'
          notes: string | null
          screenshot_url: string | null
          is_private: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          trade_date: string
          market: string
          trade_type: string
          entry_price: number
          exit_price?: number | null
          quantity: number
          profit_loss?: number | null
          status?: 'open' | 'closed'
          notes?: string | null
          screenshot_url?: string | null
          is_private?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          trade_date?: string
          market?: string
          trade_type?: string
          entry_price?: number
          exit_price?: number | null
          quantity?: number
          profit_loss?: number | null
          status?: 'open' | 'closed'
          notes?: string | null
          screenshot_url?: string | null
          is_private?: boolean
        }
      }
    }
  }
}
