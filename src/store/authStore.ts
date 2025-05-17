
import { create } from 'zustand';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@supabase/supabase-js';

interface AuthState {
  getUser: () => User | null;
  getProfile: () => any | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // This store now acts as a wrapper around the AuthContext
  // It maintains API compatibility with existing components
  return {
    getUser: () => {
      try {
        const { user } = useAuth();
        return user;
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
