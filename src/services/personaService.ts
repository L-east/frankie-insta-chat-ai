
import { supabase } from '@/integrations/supabase/client';

export interface PersonaDeploymentData {
  persona_id: string;
  scope: string;
  custom_prompt?: string;
  tone_strength?: number;
  flag_keywords?: string;
  flag_action?: string;
  time_limit?: number;
  message_count?: number;
  auto_stop?: boolean;
  mode: string;
}

export const deployPersona = async (deploymentData: PersonaDeploymentData) => {
  try {
    const { data, error } = await supabase
      .from('persona_deployments')
      .insert(deploymentData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update the user's free agents used count
    await supabase.rpc('increment_agents_used');

    return data;
  } catch (error) {
    console.error('Error deploying persona:', error);
    throw error;
  }
};

export const getUserPersonaDeployments = async () => {
  try {
    const { data, error } = await supabase
      .from('persona_deployments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching persona deployments:', error);
    throw error;
  }
};

export const getUserAgentsUsage = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('free_agents_used, free_agents_total, free_expiry_date, is_pro')
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user agents usage:', error);
    throw error;
  }
};
