
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";

export interface PersonaDeploymentData {
  persona_id: string;
  scope: string;
  mode: string;
  custom_prompt?: string;
  tone_strength?: number;
  flag_keywords?: string;
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
    user_id: user.id
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
