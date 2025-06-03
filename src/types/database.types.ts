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
      strategies: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          description: string | null
          details: string | null
          image_url: string | null
          category: string | null
          is_active: boolean
          is_private: boolean
          success_rate: number
          total_trades: number
          profitable_trades: number
          original_strategy_id: string | null
          duplicate_count: number
          is_duplicate: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
          description?: string | null
          details?: string | null
          image_url?: string | null
          category?: string | null
          is_active?: boolean
          is_private?: boolean
          success_rate?: number
          total_trades?: number
          profitable_trades?: number
          original_strategy_id?: string | null
          duplicate_count?: number
          is_duplicate?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
          description?: string | null
          details?: string | null
          image_url?: string | null
          category?: string | null
          is_active?: boolean
          is_private?: boolean
          success_rate?: number
          total_trades?: number
          profitable_trades?: number
          original_strategy_id?: string | null
          duplicate_count?: number
          is_duplicate?: boolean
        }
      }
      journal_entries: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          content: string
          is_private: boolean
          tags: string[] | null
          image_url: string | null
          trade_ids: string[] | null
          strategy_ids: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          content: string
          is_private?: boolean
          tags?: string[] | null
          image_url?: string | null
          trade_ids?: string[] | null
          strategy_ids?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          content?: string
          is_private?: boolean
          tags?: string[] | null
          image_url?: string | null
          trade_ids?: string[] | null
          strategy_ids?: string[] | null
        }
      }
      trades: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          strategy_id: string | null
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
          is_demo: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          strategy_id?: string | null
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
          is_demo?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          strategy_id?: string | null
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
          is_demo?: boolean
        }
      }
      activity_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          activity_type: 'strategies' | 'trading' | 'journal'
          activity_title: string
          activity_date: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          activity_type: 'strategies' | 'trading' | 'journal'
          activity_title: string
          activity_date?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          activity_type?: 'strategies' | 'trading' | 'journal'
          activity_title?: string
          activity_date?: string
        }
      }
    }
  }
}
