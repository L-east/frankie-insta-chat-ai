import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        toast({
          title: "Email confirmed!",
          description: "Your email has been successfully confirmed. You can now use all features of Frankie AI.",
        });

        // Redirect to home page after successful confirmation
        router.push('/');
      } catch (error: any) {
        toast({
          title: "Error confirming email",
          description: error.message || "An error occurred while confirming your email.",
          variant: "destructive",
        });
        router.push('/');
      }
    };

    handleEmailConfirmation();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Confirming your email...</h1>
        <p>Please wait while we confirm your email address.</p>
      </div>
    </div>
  );
} 