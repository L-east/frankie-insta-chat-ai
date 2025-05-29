
import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

// Define an extended user type that includes profile data
export interface ExtendedUser extends User {
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
  getUser: () => ExtendedUser | null;
  getProfile: () => any | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  setUser: (user: ExtendedUser | null) => void;
  _authContext: any; // Internal reference to auth context
  setAuthContext: (context: any) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  _authContext: null,

  setAuthContext: (context: any) => {
    set({ _authContext: context });
  },

  setUser: (user: ExtendedUser | null) => {
    set({ user });
  },
  
  getUser: () => {
    const state = get();
    const context = state._authContext;
    
    if (!context) {
      console.error('Auth context not available');
      return state.user;
    }

    try {
      const { user, profile } = context;
      // Create an extended user with profile data
      const extendedUser = user ? {
        ...user,
        isPro: profile?.is_pro || false,
        freeAgentsUsed: profile?.free_agents_used || 0,
        freeAgentsTotal: profile?.free_agents_total || 7,
        freeExpiryDate: profile?.free_expiry_date ? new Date(profile.free_expiry_date) : undefined,
        freeMessagesUsed: profile?.free_messages_used || 0,
        freeMessagesQuota: profile?.free_messages_quota || 100,
        freeMessagesExpiry: profile?.free_messages_expiry ? new Date(profile.free_messages_expiry) : undefined
      } : null;
      
      // Update the store's user state
      set({ user: extendedUser });
      return extendedUser;
    } catch (error) {
      console.error('Error accessing auth context:', error);
      return state.user;
    }
  },

  getProfile: () => {
    const context = get()._authContext;
    if (!context) {
      console.error('Auth context not available');
      return null;
    }

    try {
      const { profile } = context;
      return profile;
    } catch (error) {
      console.error('Error accessing auth context:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    const context = get()._authContext;
    if (!context) {
      console.error('Auth context not available');
      return false;
    }

    try {
      const { session } = context;
      return !!session;
    } catch (error) {
      console.error('Error accessing auth context:', error);
      return false;
    }
  },

  isLoading: () => {
    const context = get()._authContext;
    if (!context) {
      return false;
    }

    try {
      const { isLoading } = context;
      return isLoading;
    } catch (error) {
      console.error('Error accessing auth context:', error);
      return false;
    }
  },
  
  login: async (email: string, password: string) => {
    const context = get()._authContext;
    if (!context) throw new Error('Auth context not available');
    
    const { signIn } = context;
    await signIn(email, password);
  },
  
  signup: async (email: string, password: string, name: string) => {
    const context = get()._authContext;
    if (!context) throw new Error('Auth context not available');
    
    const { signUp } = context;
    await signUp(email, password, name);
  },
  
  logout: async () => {
    const context = get()._authContext;
    if (!context) throw new Error('Auth context not available');
    
    const { signOut } = context;
    await signOut();
  },
  
  forgotPassword: async (email: string) => {
    const context = get()._authContext;
    if (!context) throw new Error('Auth context not available');
    
    const { resetPassword } = context;
    await resetPassword(email);
  }
}));
