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
      login_tracking: {
        Row: {
          device_info: string | null
          id: string
          ip_address: string | null
          login_timestamp: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          device_info?: string | null
          id?: string
          ip_address?: string | null
          login_timestamp?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          device_info?: string | null
          id?: string
          ip_address?: string | null
          login_timestamp?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
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
      payment_records: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          messages_purchased: number
          payment_id: string
          payment_provider: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          messages_purchased: number
          payment_id: string
          payment_provider?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          messages_purchased?: number
          payment_id?: string
          payment_provider?: string
          status?: string
          updated_at?: string | null
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
      personas: {
        Row: {
          attributes: string[] | null
          avatar_url: string | null
          behavior_snapshot: string | null
          created_at: string | null
          description: string
          id: string
          is_premium: boolean | null
          name: string
          perspective: string | null
          tags: string[] | null
          traits: string[] | null
          updated_at: string | null
        }
        Insert: {
          attributes?: string[] | null
          avatar_url?: string | null
          behavior_snapshot?: string | null
          created_at?: string | null
          description: string
          id: string
          is_premium?: boolean | null
          name: string
          perspective?: string | null
          tags?: string[] | null
          traits?: string[] | null
          updated_at?: string | null
        }
        Update: {
          attributes?: string[] | null
          avatar_url?: string | null
          behavior_snapshot?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_premium?: boolean | null
          name?: string
          perspective?: string | null
          tags?: string[] | null
          traits?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
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
      user_deployments: {
        Row: {
          auto_stop: boolean | null
          created_at: string | null
          custom_prompt: string | null
          flag_action: string | null
          flag_keywords: string[] | null
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
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_stop?: boolean | null
          created_at?: string | null
          custom_prompt?: string | null
          flag_action?: string | null
          flag_keywords?: string[] | null
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
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_stop?: boolean | null
          created_at?: string | null
          custom_prompt?: string | null
          flag_action?: string | null
          flag_keywords?: string[] | null
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
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_deployments_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
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
      user_messages_new: {
        Row: {
          chat_context: string | null
          content: string
          created_at: string | null
          id: string
          persona_id: string | null
          platform: string | null
          response: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_context?: string | null
          content: string
          created_at?: string | null
          id?: string
          persona_id?: string | null
          platform?: string | null
          response?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_context?: string | null
          content?: string
          created_at?: string | null
          id?: string
          persona_id?: string | null
          platform?: string | null
          response?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_messages_new_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          free_agents_total: number | null
          free_agents_used: number | null
          free_expiry_date: string | null
          free_messages_expiry: string | null
          free_messages_quota: number | null
          free_messages_used: number | null
          id: string
          is_pro: boolean | null
          lifetime_messages_allocated: number | null
          lifetime_messages_used: number | null
          name: string | null
          total_messages_allocated: number | null
          total_messages_pending: number | null
          total_messages_used: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          free_agents_total?: number | null
          free_agents_used?: number | null
          free_expiry_date?: string | null
          free_messages_expiry?: string | null
          free_messages_quota?: number | null
          free_messages_used?: number | null
          id: string
          is_pro?: boolean | null
          lifetime_messages_allocated?: number | null
          lifetime_messages_used?: number | null
          name?: string | null
          total_messages_allocated?: number | null
          total_messages_pending?: number | null
          total_messages_used?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          free_agents_total?: number | null
          free_agents_used?: number | null
          free_expiry_date?: string | null
          free_messages_expiry?: string | null
          free_messages_quota?: number | null
          free_messages_used?: number | null
          id?: string
          is_pro?: boolean | null
          lifetime_messages_allocated?: number | null
          lifetime_messages_used?: number | null
          name?: string | null
          total_messages_allocated?: number | null
          total_messages_pending?: number | null
          total_messages_used?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_purchased_messages: {
        Args: { user_uuid: string; message_count: number }
        Returns: undefined
      }
      get_user_stats: {
        Args: { user_uuid: string }
        Returns: {
          free_messages_remaining: number
          total_messages_remaining: number
          free_agents_remaining: number
          is_pro: boolean
        }[]
      }
      increment_agent_usage: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      increment_message_usage: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      increment_messages_used: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      initialize_user_messages: {
        Args:
          | { user_id: string }
          | { user_id: string; user_email: string; user_name: string }
        Returns: undefined
      }
      update_message_quota: {
        Args: { user_id: string; amount: number }
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
