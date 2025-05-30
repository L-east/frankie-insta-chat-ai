
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export default function ResetPassword() {
  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Handle the password reset callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Password reset error:', error);
          toast({
            title: "Password Reset Error",
            description: error.message || "An error occurred during password reset.",
            variant: "destructive",
          });
          window.location.href = '/';
          return;
        }

        if (data.session) {
          toast({
            title: "Password Reset Successful!",
            description: "You can now set a new password.",
          });
          
          // Redirect to settings or profile page
          window.location.href = '/settings';
        } else {
          // No session, redirect to home
          window.location.href = '/';
        }
      } catch (error: any) {
        console.error('Password reset error:', error);
        toast({
          title: "Password Reset Error",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        window.location.href = '/';
      }
    };

    handlePasswordReset();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing password reset...</h1>
        <p>Please wait while we complete your password reset.</p>
      </div>
    </div>
  );
}
