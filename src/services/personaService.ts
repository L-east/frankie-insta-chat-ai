import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";

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

export const createPersonaDeployment = async (deploymentData: PersonaDeploymentData) => {
  const user = useAuthStore.getState().getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to create a persona deployment");
  }

  const dataWithUserId = {
    ...deploymentData,
    user_id: user.id,
    flag_keywords: deploymentData.flag_keywords && deploymentData.flag_keywords.length > 0 
      ? deploymentData.flag_keywords.join(',') 
      : null
  };

  const { data, error } = await supabase
    .from('persona_deployments')
    .insert(dataWithUserId);

  if (error) throw error;
  return data;
};

export const getUserDeployments = async () => {
  const user = useAuthStore.getState().getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to get deployments");
  }

  const { data, error } = await supabase
    .from('persona_deployments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const incrementAgentUsed = async () => {
  const user = useAuthStore.getState().getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to increment agent usage");
  }

  const { error } = await supabase.rpc('increment_agents_used', { user_id: user.id });

  if (error) throw error;
  return true;
};

export const incrementMessageUsed = async () => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError) throw profileError;
  
  const updates = {
    total_messages_used: (profile.total_messages_used || 0) + 1,
    total_messages_pending: (profile.total_messages_pending || 0) - 1,
    lifetime_messages_used: (profile.lifetime_messages_used || 0) + 1
  };
  
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);
    
  if (error) throw error;
};

export const addMessagesToQuota = async (messageCount: number) => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;
  
  const updates = {
    total_messages_allocated: (profile.total_messages_allocated || 0) + messageCount,
    total_messages_pending: (profile.total_messages_pending || 0) + messageCount,
    lifetime_messages_allocated: (profile.lifetime_messages_allocated || 0) + messageCount
  };
  
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) throw error;
};

export const getUserAgentsUsage = async () => {
  const user = useAuthStore.getState().getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to get agent usage");
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('free_agents_used, free_agents_total, free_expiry_date, free_messages_used, free_messages_quota, free_messages_expiry')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
};

export const getDeploymentHistory = async () => {
  const user = useAuthStore.getState().getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to get deployment history");
  }

  const { data, error } = await supabase
    .from('persona_deployments')
    .select('*, persona_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getUserTransactions = async () => {
  const user = useAuthStore.getState().getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to get transactions");
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export interface MessagePackage {
  count: number;
  price: number;
}

// Configurable pricing parameters
export const PRICING_CONFIG = {
  FREE_MESSAGES: 10,
  MESSAGE_PRICE_CENTS: 10, // 10 cents per message
  MESSAGE_VALIDITY_DAYS: 30,
  PACKAGES: [
    { count: 100, price: 0.01 },
    { count: 10, price: 1.00 },
    { count: 50, price: 5.00 },
    { count: 100, price: 10.00 },
  ] as MessagePackage[]
};

export const MESSAGE_PACKAGES: MessagePackage[] = PRICING_CONFIG.PACKAGES;
export const FREE_MESSAGES = PRICING_CONFIG.FREE_MESSAGES;
export const MESSAGE_EXPIRY_DAYS = PRICING_CONFIG.MESSAGE_VALIDITY_DAYS;
