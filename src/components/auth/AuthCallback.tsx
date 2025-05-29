
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Auth callback params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Auth callback error:', error);
            toast({
              title: "Authentication Error",
              description: error.message,
              variant: "destructive",
            });
            navigate('/');
            return;
          }

          if (data.session) {
            const user = data.session.user;
            
            if (type === 'signup' || type === 'email_confirmation') {
              toast({
                title: "Email confirmed!",
                description: "Your account has been verified successfully.",
              });
            } else if (type === 'recovery') {
              // Redirect to password reset page
              navigate('/auth/reset-password');
              return;
            } else {
              toast({
                title: "Welcome!",
                description: "You've been successfully authenticated.",
              });
            }
            
            // Clear the URL parameters and redirect to main app
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/');
          } else {
            navigate('/');
          }
        } else {
          // Check for existing session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session check error:', error);
          }
          
          navigate('/');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
