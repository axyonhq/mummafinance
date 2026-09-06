export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      finance_items: {
        Row: {
          amount_cents: number
          category: string
          color: string
          created_at: string
          duration: Database['public']['Enums']['item_duration']
          fortnightly_cents: number
          frequency: Database['public']['Enums']['payment_frequency']
          id: string
          is_active: boolean
          label: string
          notes: string | null
          payments_remaining: number | null
          starts_on: string
          total_payments: number | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          category?: string
          color?: string
          created_at?: string
          duration?: Database['public']['Enums']['item_duration']
          fortnightly_cents: number
          frequency?: Database['public']['Enums']['payment_frequency']
          id?: string
          is_active?: boolean
          label: string
          notes?: string | null
          payments_remaining?: number | null
          starts_on?: string
          total_payments?: number | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          category?: string
          color?: string
          created_at?: string
          duration?: Database['public']['Enums']['item_duration']
          fortnightly_cents?: number
          frequency?: Database['public']['Enums']['payment_frequency']
          id?: string
          is_active?: boolean
          label?: string
          notes?: string | null
          payments_remaining?: number | null
          starts_on?: string
          total_payments?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_cents: number
          category: string
          created_at: string
          description: string
          id: string
          kind: string
          notes: string | null
          occurred_on: string
        }
        Insert: {
          amount_cents: number
          category?: string
          created_at?: string
          description: string
          id?: string
          kind: string
          notes?: string | null
          occurred_on?: string
        }
        Update: {
          amount_cents?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          kind?: string
          notes?: string | null
          occurred_on?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calc_fortnightly_cents: {
        Args: {
          p_amount_cents: number
          p_frequency: Database['public']['Enums']['payment_frequency']
        }
        Returns: number
      }
      cycles_elapsed: {
        Args: {
          p_as_of?: string
          p_frequency: Database['public']['Enums']['payment_frequency']
          p_starts_on: string
        }
        Returns: number
      }
      sync_temporary_finance_items: { Args: never; Returns: number }
    }
    Enums: {
      item_duration: 'ongoing' | 'temporary'
      payment_frequency:
        | 'daily'
        | 'weekly'
        | 'fortnightly'
        | 'monthly'
        | 'annually'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type PaymentFrequency = Database['public']['Enums']['payment_frequency']
export type ItemDuration = Database['public']['Enums']['item_duration']
export type FinanceItem = Database['public']['Tables']['finance_items']['Row']
export type FinanceItemInsert =
  Database['public']['Tables']['finance_items']['Insert']
export type FinanceItemUpdate =
  Database['public']['Tables']['finance_items']['Update']
