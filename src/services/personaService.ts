
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
  created_at: string;
  updated_at: string;
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

// Get user profile with message credits
export const getUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated");
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
};

// Check if user has sufficient credits for deployment
export const checkSufficientCredits = async (messageCount: number): Promise<boolean> => {
  const profile = await getUserProfile();
  if (!profile) return false;

  const freeMessagesRemaining = Math.max(0, profile.free_messages_quota - profile.free_messages_used);
  const paidMessagesRemaining = profile.total_messages_pending;
  const totalAvailable = freeMessagesRemaining + paidMessagesRemaining;

  return totalAvailable >= messageCount;
};

// Get available message credits breakdown
export const getMessageCredits = async () => {
  const profile = await getUserProfile();
  if (!profile) {
    return {
      freeMessagesRemaining: 0,
      paidMessagesRemaining: 0,
      totalAvailable: 0,
      totalUsed: 0,
      freeExpired: false
    };
  }

  const now = new Date();
  const expiryDate = new Date(profile.free_messages_expiry);
  const freeExpired = now > expiryDate;
  
  const freeMessagesRemaining = freeExpired ? 0 : Math.max(0, profile.free_messages_quota - profile.free_messages_used);
  const paidMessagesRemaining = profile.total_messages_pending;
  const totalAvailable = freeMessagesRemaining + paidMessagesRemaining;
  const totalUsed = profile.free_messages_used + profile.total_messages_used;

  return {
    freeMessagesRemaining,
    paidMessagesRemaining,
    totalAvailable,
    totalUsed,
    freeExpired,
    profile
  };
};

// Create a new persona deployment with credit check
export const createPersonaDeployment = async (deploymentData: PersonaDeploymentData): Promise<PersonaDeployment> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to create a persona deployment");
  }

  const messageCount = deploymentData.message_count || 1;

  // Check if user has sufficient credits
  const hasSufficientCredits = await checkSufficientCredits(messageCount);
  if (!hasSufficientCredits) {
    throw new Error("Insufficient message credits. Please purchase more messages.");
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

// Update message usage when a message is sent
export const updateMessageUsage = async (deploymentId: string, messagesSent: number = 1): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated");
  }

  // Get current profile to determine which credits to use
  const profile = await getUserProfile();
  if (!profile) {
    throw new Error("User profile not found");
  }

  const now = new Date();
  const expiryDate = new Date(profile.free_messages_expiry);
  const freeExpired = now > expiryDate;
  
  let freeMessagesToUse = 0;
  let paidMessagesToUse = 0;

  if (!freeExpired) {
    const freeMessagesRemaining = Math.max(0, profile.free_messages_quota - profile.free_messages_used);
    freeMessagesToUse = Math.min(messagesSent, freeMessagesRemaining);
    paidMessagesToUse = messagesSent - freeMessagesToUse;
  } else {
    paidMessagesToUse = messagesSent;
  }

  // Update user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({
      free_messages_used: profile.free_messages_used + freeMessagesToUse,
      total_messages_used: profile.total_messages_used + paidMessagesToUse,
      total_messages_pending: profile.total_messages_pending - paidMessagesToUse,
      lifetime_messages_used: profile.lifetime_messages_used + messagesSent,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (profileError) {
    console.error('Error updating user profile:', profileError);
    throw profileError;
  }

  // Update deployment
  const { error: deploymentError } = await supabase
    .from('user_deployments')
    .update({
      messages_sent: messagesSent,
      last_activity_time: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', deploymentId);

  if (deploymentError) {
    console.error('Error updating deployment:', deploymentError);
    throw deploymentError;
  }
};

// Legacy function for backward compatibility
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

// Get user statistics (message-related stats)
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
  PACKAGES: [
    { count: 10, price: 1.00 },
    { count: 50, price: 5.00 },
    { count: 100, price: 10.00 },
    { count: 500, price: 45.00 },
  ] as MessagePackage[]
};

export const MESSAGE_PACKAGES: MessagePackage[] = PRICING_CONFIG.PACKAGES;
export const FREE_MESSAGES = PRICING_CONFIG.FREE_MESSAGES;
