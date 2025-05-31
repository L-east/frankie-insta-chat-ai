
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile, getMessageCredits } from './personaService';

export interface MessageUsageUpdate {
  deploymentId: string;
  messagesSent: number;
}

// Update message usage in both user_profiles and user_deployments
export const updateMessageUsage = async (deploymentId: string, messagesSent: number = 1): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated");
  }

  console.log('Updating message usage:', { deploymentId, messagesSent, userId: user.id });

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

  console.log('Message allocation:', { freeMessagesToUse, paidMessagesToUse, freeExpired });

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

  console.log('Message usage updated successfully');
};

// Check if user has sufficient credits for deployment
export const checkSufficientCredits = async (messageCount: number): Promise<boolean> => {
  const credits = await getMessageCredits();
  return credits.totalAvailable >= messageCount;
};

// Simulate message being sent (for testing/demo purposes)
export const simulateMessageSent = async (deploymentId: string): Promise<void> => {
  console.log('Simulating message sent for deployment:', deploymentId);
  await updateMessageUsage(deploymentId, 1);
};
