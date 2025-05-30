
export interface Persona {
  id: string;
  name: string;
  description: string;
  avatar_url?: string;
  is_premium: boolean;
  perspective: string;
  behavior_snapshot?: string;
  attributes?: string[];
  traits?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface PersonaDeployment {
  id: string;
  user_id: string;
  persona_id: string;
  scope: string;
  mode: string;
  custom_prompt?: string;
  tone_strength: number;
  flag_keywords?: string[];
  flag_action: string;
  time_limit?: number;
  message_count?: number;
  auto_stop: boolean;
  status: string;
  start_time: string;
  last_activity_time: string;
  messages_sent: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  free_messages_quota: number;
  free_messages_used: number;
  free_messages_expiry: string;
  total_messages_allocated: number;
  total_messages_used: number;
  total_messages_pending: number;
  lifetime_messages_allocated: number;
  lifetime_messages_used: number;
  free_agents_used: number;
  free_agents_total: number;
  free_expiry_date: string;
  is_pro: boolean;
  created_at: string;
  updated_at: string;
}
