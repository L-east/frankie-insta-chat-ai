export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      login_history: {
        Row: {
          device_info: string | null
          id: string
          ip_address: string | null
          login_timestamp: string
          user_id: string
        }
        Insert: {
          device_info?: string | null
          id?: string
          ip_address?: string | null
          login_timestamp?: string
          user_id: string
        }
        Update: {
          device_info?: string | null
          id?: string
          ip_address?: string | null
          login_timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          messages_purchased: number
          payment_id: string
          payment_provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          messages_purchased: number
          payment_id: string
          payment_provider: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          messages_purchased?: number
          payment_id?: string
          payment_provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      persona_deployments: {
        Row: {
          auto_stop: boolean | null
          created_at: string
          custom_prompt: string | null
          flag_action: string | null
          flag_keywords: string | null
          id: string
          last_activity_time: string | null
          message_count: number | null
          messages_sent: number | null
          mode: string
          persona_id: string
          scope: string
          start_time: string | null
          status: string | null
          time_limit: number | null
          tone_strength: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_stop?: boolean | null
          created_at?: string
          custom_prompt?: string | null
          flag_action?: string | null
          flag_keywords?: string | null
          id?: string
          last_activity_time?: string | null
          message_count?: number | null
          messages_sent?: number | null
          mode: string
          persona_id: string
          scope: string
          start_time?: string | null
          status?: string | null
          time_limit?: number | null
          tone_strength?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_stop?: boolean | null
          created_at?: string
          custom_prompt?: string | null
          flag_action?: string | null
          flag_keywords?: string | null
          id?: string
          last_activity_time?: string | null
          message_count?: number | null
          messages_sent?: number | null
          mode?: string
          persona_id?: string
          scope?: string
          start_time?: string | null
          status?: string | null
          time_limit?: number | null
          tone_strength?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "persona_deployments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          free_messages_expiry: string | null
          free_messages_quota: number | null
          free_messages_used: number | null
          id: string
          lifetime_messages_allocated: number | null
          lifetime_messages_used: number | null
          name: string | null
          total_messages_allocated: number | null
          total_messages_pending: number | null
          total_messages_used: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          free_messages_expiry?: string | null
          free_messages_quota?: number | null
          free_messages_used?: number | null
          id: string
          lifetime_messages_allocated?: number | null
          lifetime_messages_used?: number | null
          name?: string | null
          total_messages_allocated?: number | null
          total_messages_pending?: number | null
          total_messages_used?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          free_messages_expiry?: string | null
          free_messages_quota?: number | null
          free_messages_used?: number | null
          id?: string
          lifetime_messages_allocated?: number | null
          lifetime_messages_used?: number | null
          name?: string | null
          total_messages_allocated?: number | null
          total_messages_pending?: number | null
          total_messages_used?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          expiry_date: string | null
          id: string
          messages_purchased: number
          messages_used: number | null
          payment_id: string
          payment_provider: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          expiry_date?: string | null
          id?: string
          messages_purchased: number
          messages_used?: number | null
          payment_id: string
          payment_provider: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          expiry_date?: string | null
          id?: string
          messages_purchased?: number
          messages_used?: number | null
          payment_id?: string
          payment_provider?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          created_at: string
          id: string
          last_purchase_date: string | null
          total_messages: number
          updated_at: string
          used_messages: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_purchase_date?: string | null
          total_messages?: number
          updated_at?: string
          used_messages?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_purchase_date?: string | null
          total_messages?: number
          updated_at?: string
          used_messages?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_messages_used: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
