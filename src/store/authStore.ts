
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface ExtendedUser extends User {
  isPro?: boolean;
  freeAgentsUsed?: number;
  freeAgentsTotal?: number;
  freeExpiryDate?: Date;
  freeMessagesUsed?: number;
  freeMessagesQuota?: number;
  freeMessagesExpiry?: Date;
}

interface AuthState {
  user: ExtendedUser | null;
  setUser: (user: ExtendedUser | null) => void;
  getUser: () => ExtendedUser | null;
  getProfile: () => any | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  
  setUser: (user: ExtendedUser | null) => {
    set({ user });
  },
  
  getUser: () => {
    return get().user;
  },

  getProfile: () => {
    // This will be handled by the AuthContext
    return null;
  },

  isAuthenticated: () => {
    return !!get().user;
  },

  isLoading: () => {
    // This will be handled by the AuthContext
    return false;
  },
  
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      set({ user: data.user as ExtendedUser });
    }
  },
  
  signup: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) throw error;
    
    if (data.user) {
      set({ user: data.user as ExtendedUser });
    }
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    set({ user: null });
  },
  
  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
}));
