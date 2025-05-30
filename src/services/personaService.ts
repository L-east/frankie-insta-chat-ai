
import { supabase } from "@/integrations/supabase/client";

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

export interface PersonaDeploymentData {
  persona_id: string;
  scope: string;
  mode: string;
  custom_prompt?: string;
  tone_strength?: number;
  flag_keywords?: string[];
  flag_action?: string;
  time_limit?: number;
  message_count?: number;
  auto_stop?: boolean;
}

// Fetch all personas
export const getPersonas = async (): Promise<Persona[]> => {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching personas:', error);
    throw error;
  }

  return data || [];
};

// Create a new persona deployment
export const createPersonaDeployment = async (deploymentData: PersonaDeploymentData): Promise<PersonaDeployment> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to create a persona deployment");
  }

  const dataWithUserId = {
    ...deploymentData,
    user_id: user.id,
    tone_strength: deploymentData.tone_strength || 5,
    flag_action: deploymentData.flag_action || 'pause',
    auto_stop: deploymentData.auto_stop !== false
  };

  const { data, error } = await supabase
    .from('user_deployments')
    .insert(dataWithUserId)
    .select()
    .single();

  if (error) {
    console.error('Error creating deployment:', error);
    throw error;
  }

  return data;
};

// Get user's deployments
export const getUserDeployments = async (): Promise<PersonaDeployment[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to get deployments");
  }

  const { data, error } = await supabase
    .from('user_deployments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deployments:', error);
    throw error;
  }

  return data || [];
};

// Increment message usage
export const incrementMessageUsage = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to increment message usage");
  }

  const { error } = await supabase.rpc('increment_message_usage', { 
    user_uuid: user.id 
  });

  if (error) {
    console.error('Error incrementing message usage:', error);
    throw error;
  }
};

// Add purchased messages to user's quota
export const addMessagesToQuota = async (messageCount: number): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to add messages");
  }

  const { error } = await supabase.rpc('add_purchased_messages', { 
    user_uuid: user.id,
    message_count: messageCount
  });

  if (error) {
    console.error('Error adding messages to quota:', error);
    throw error;
  }
};

// Get user statistics (removed agent tracking)
export const getUserStats = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to get stats");
  }

  const { data, error } = await supabase.rpc('get_user_stats', { 
    user_uuid: user.id 
  });

  if (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }

  return data?.[0] || null;
};

// Get deployment history
export const getDeploymentHistory = async (): Promise<PersonaDeployment[]> => {
  return getUserDeployments();
};

// Update deployment status
export const updateDeploymentStatus = async (deploymentId: string, status: string): Promise<void> => {
  const { error } = await supabase
    .from('user_deployments')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', deploymentId);

  if (error) {
    console.error('Error updating deployment status:', error);
    throw error;
  }
};

// Delete deployment
export const deleteDeployment = async (deploymentId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_deployments')
    .delete()
    .eq('id', deploymentId);

  if (error) {
    console.error('Error deleting deployment:', error);
    throw error;
  }
};

// Message packages configuration
export interface MessagePackage {
  count: number;
  price: number;
}

export const PRICING_CONFIG = {
  FREE_MESSAGES: 10,
  MESSAGE_PRICE_CENTS: 10,
  MESSAGE_VALIDITY_DAYS: 30,
  PACKAGES: [
    { count: 10, price: 1.00 },
    { count: 50, price: 5.00 },
    { count: 100, price: 10.00 },
    { count: 500, price: 45.00 },
  ] as MessagePackage[]
};

export const MESSAGE_PACKAGES: MessagePackage[] = PRICING_CONFIG.PACKAGES;
export const FREE_MESSAGES = PRICING_CONFIG.FREE_MESSAGES;
export const MESSAGE_EXPIRY_DAYS = PRICING_CONFIG.MESSAGE_VALIDITY_DAYS;
