
import { create } from 'zustand';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@supabase/supabase-js';

// Define an extended user type that includes profile data
export interface ExtendedUser extends User {
  isPro?: boolean;
  freeAgentsUsed?: number;
  freeAgentsTotal?: number;
  freeExpiryDate?: Date;
}

interface AuthState {
  getUser: () => ExtendedUser | null;
  getProfile: () => any | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  user: ExtendedUser | null; // Changed to ExtendedUser
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Get initial user state
  let initialUser: ExtendedUser | null = null;
  try {
    const { user, profile } = useAuth();
    initialUser = user ? {
      ...user,
      isPro: profile?.is_pro || false,
      freeAgentsUsed: profile?.free_agents_used || 0,
      freeAgentsTotal: profile?.free_agents_total || 7,
      freeExpiryDate: profile?.free_expiry_date ? new Date(profile.free_expiry_date) : undefined
    } : null;
  } catch (error) {
    console.error('Error accessing auth context:', error);
    initialUser = null;
  }

  return {
    user: initialUser,
    
    getUser: () => {
      try {
        const { user, profile } = useAuth();
        // Create an extended user with profile data
        const extendedUser = user ? {
          ...user,
          isPro: profile?.is_pro || false,
          freeAgentsUsed: profile?.free_agents_used || 0,
          freeAgentsTotal: profile?.free_agents_total || 7,
          freeExpiryDate: profile?.free_expiry_date ? new Date(profile.free_expiry_date) : undefined
        } : null;
        
        // Update the store's user state
        set({ user: extendedUser });
        return extendedUser;
      } catch (error) {
        console.error('Error accessing auth context:', error);
        return null;
      }
    },

    getProfile: () => {
      try {
        const { profile } = useAuth();
        return profile;
      } catch (error) {
        console.error('Error accessing auth context:', error);
        return null;
      }
    },

    isAuthenticated: () => {
      try {
        const { session } = useAuth();
        return !!session;
      } catch (error) {
        console.error('Error accessing auth context:', error);
        return false;
      }
    },

    isLoading: () => {
      try {
        const { isLoading } = useAuth();
        return isLoading;
      } catch (error) {
        console.error('Error accessing auth context:', error);
        return false;
      }
    },
    
    login: async (email: string, password: string) => {
      const { signIn } = useAuth();
      await signIn(email, password);
    },
    
    signup: async (email: string, password: string, name: string) => {
      const { signUp } = useAuth();
      await signUp(email, password, name);
    },
    
    logout: async () => {
      const { signOut } = useAuth();
      await signOut();
    },
    
    forgotPassword: async (email: string) => {
      const { resetPassword } = useAuth();
      await resetPassword(email);
    }
  };
});
