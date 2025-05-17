
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  freeAgentsUsed: number;
  freeAgentsTotal: number;
  freeExpiryDate: Date;
  isPro: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Mock authentication - would be replaced with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ 
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '1',
          name: 'Demo User',
          email,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
          freeAgentsUsed: 3,
          freeAgentsTotal: 7,
          freeExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          isPro: false
        }
      });
    } catch (error) {
      set({ isLoading: false });
      throw new Error('Login failed. Please check your credentials.');
    }
  },
  
  signup: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    try {
      // Mock signup - would be replaced with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ 
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: '1',
          name,
          email,
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + name,
          freeAgentsUsed: 0,
          freeAgentsTotal: 7,
          freeExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          isPro: false
        }
      });
    } catch (error) {
      set({ isLoading: false });
      throw new Error('Signup failed. Please try again.');
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  
  forgotPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      // Mock password reset - would be replaced with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw new Error('Password reset failed. Please try again.');
    }
  }
}));
