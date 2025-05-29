
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithSocialProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get the current origin - works for both localhost and extension
  const getCurrentOrigin = () => {
    if (typeof window !== 'undefined') {
      // For Chrome extension
      if (window.location.protocol === 'chrome-extension:') {
        return window.location.origin;
      }
      // For web app
      return window.location.origin;
    }
    return 'http://localhost:5173'; // fallback
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change:', event, currentSession?.user?.email);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Defer profile fetching
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        // Handle email confirmation
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          const user = currentSession?.user;
          if (user && !user.email_confirmed_at) {
            toast({
              title: "Email confirmation required",
              description: "Please check your email and click the confirmation link to complete your account setup.",
              variant: "default",
            });
          }
        }
        
        if (event === 'SIGNED_IN') {
          // Log login history
          setTimeout(async () => {
            try {
              await supabase
                .from('login_history')
                .insert({
                  user_id: currentSession?.user.id,
                  device_info: navigator.userAgent,
                  ip_address: null
                });
            } catch (error) {
              console.error('Error logging login history:', error);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const redirectUrl = getCurrentOrigin();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            display_name: name
          },
          emailRedirectTo: `${redirectUrl}/#/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create profile with name
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            free_messages_quota: 10,
            free_messages_used: 0,
            total_messages_allocated: 10,
            total_messages_pending: 10
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        if (!data.user.email_confirmed_at) {
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link. Please click it to verify your account.",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to Frankie AI!",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Email confirmation required",
          description: "Please check your email and click the confirmation link.",
          variant: "default",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithSocialProvider = async (provider: Provider) => {
    setIsLoading(true);
    try {
      const redirectUrl = getCurrentOrigin();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${redirectUrl}/#/auth/callback`
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Social login failed",
        description: error.message || `An error occurred during ${provider} login.`,
        variant: "destructive",
      });
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const redirectUrl = getCurrentOrigin();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectUrl}/#/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset link sent",
        description: "Please check your email to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send reset link",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmation = async (email: string) => {
    setIsLoading(true);
    try {
      const redirectUrl = getCurrentOrigin();
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${redirectUrl}/#/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Confirmation email sent",
        description: "Please check your email for the confirmation link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend confirmation",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signInWithSocialProvider,
    signOut,
    resetPassword,
    resendConfirmation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
