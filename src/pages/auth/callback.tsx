
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication Error",
            description: error.message || "An error occurred during authentication.",
            variant: "destructive",
          });
          router.push('/');
          return;
        }

        if (data.session) {
          toast({
            title: "Authentication Successful!",
            description: "You have been successfully authenticated.",
          });
          
          // Redirect to home page after successful authentication
          router.push('/');
        } else {
          // No session, redirect to home
          router.push('/');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication Error",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing authentication...</h1>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
