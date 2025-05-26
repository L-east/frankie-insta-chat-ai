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
      : undefined
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
  const user = useAuthStore.getState().getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to increment message usage");
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('free_messages_used')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;
  
  const currentCount = profile?.free_messages_used || 0;
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ free_messages_used: currentCount + 1 })
    .eq('id', user.id);

  if (error) throw error;
  return data;
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

export const MESSAGE_PACKAGES: MessagePackage[] = [
  { count: 10, price: 0.10 },
  { count: 50, price: 0.50 },
  { count: 100, price: 1.00 },
  { count: 200, price: 2.00 },
  { count: 500, price: 5.00 },
  { count: 1000, price: 10.00 },
  { count: 5000, price: 50.00 },
];

export const FREE_MESSAGES = 100;
export const MESSAGE_EXPIRY_DAYS = 30;
