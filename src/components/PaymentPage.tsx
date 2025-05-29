import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { PRICING_CONFIG } from '@/services/personaService';

interface PaymentPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onBack, onSuccess }) => {
  const [selectedPackage, setSelectedPackage] = useState<number>(2); // Default to 100 messages
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handlePayment = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to make a payment.",
        variant: "destructive"
      });
      return;
    }

    // Check if email is verified
    const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      toast({
        title: "Authentication Error",
        description: "Unable to verify your account status. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!userData?.email_confirmed_at) {
      toast({
        title: "Email Verification Required",
        description: "Please verify your email address before making a payment. Check your inbox for the verification link.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating payment for package:', PRICING_CONFIG.PACKAGES[selectedPackage]);
      
      // Create payment through Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          package: PRICING_CONFIG.PACKAGES[selectedPackage],
          userId: user.id
        }
      });

      if (error) {
        console.error('Payment creation error:', error);
        throw new Error(error.message || 'Failed to create payment');
      }

      if (!data?.paymentUrl) {
        console.error('No payment URL returned:', data);
        throw new Error('No payment URL received from server');
      }

      console.log('Payment created successfully, redirecting to:', data.paymentUrl);
      
      // Open PayPal in a new tab
      window.open(data.paymentUrl, '_blank');

      // Poll for payment status
      const checkPaymentStatus = setInterval(async () => {
        try {
          console.log('Checking payment status...');
          const { data: statusData, error: statusError } = await supabase.functions.invoke('check-payment-status', {
            body: { userId: user.id }
          });

          if (statusError) {
            console.error('Status check error:', statusError);
            clearInterval(checkPaymentStatus);
            throw statusError;
          }

          console.log('Payment status:', statusData);

          if (statusData?.status === 'completed') {
            clearInterval(checkPaymentStatus);
            toast({
              title: "Payment successful!",
              description: `You now have ${PRICING_CONFIG.PACKAGES[selectedPackage].count} additional messages.`,
            });
            onSuccess();
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          clearInterval(checkPaymentStatus);
          toast({
            title: "Payment Status Error",
            description: "There was an issue checking your payment status. Please contact support if the payment was successful.",
            variant: "destructive"
          });
        }
      }, 5000);

      // Clear interval after 5 minutes (timeout)
      setTimeout(() => {
        clearInterval(checkPaymentStatus);
        console.log('Payment status check timed out');
      }, 300000);

    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment processing error",
        description: error instanceof Error ? error.message : "There was an issue processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 h-full overflow-y-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Purchase Frankie AI Messages</h1>
        <p className="text-gray-600">Messages are valid for {PRICING_CONFIG.MESSAGE_VALIDITY_DAYS} days from purchase</p>
        <p className="text-sm text-gray-500 mt-1">Price: {PRICING_CONFIG.MESSAGE_PRICE_CENTS} cent per message</p>
      </div>
      
      <div className="space-y-6 pb-20">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Free Messages Included</h3>
          <p className="text-blue-700 text-sm">New users get {PRICING_CONFIG.FREE_MESSAGES} free messages to start with!</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {PRICING_CONFIG.PACKAGES.map((pkg, index) => (
            <div 
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPackage === index 
                  ? 'border-frankiePurple bg-frankiePurple/5' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setSelectedPackage(index)}
            >
              <div className="text-center">
                <div className="text-xl font-bold">{pkg.count}</div>
                <div className="text-sm text-gray-600">messages</div>
                <div className="text-lg font-semibold mt-2">${pkg.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Payment Details</h2>
            <CreditCard className="text-gray-400" />
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Package</span>
              <span>{PRICING_CONFIG.PACKAGES[selectedPackage].count} Messages</span>
            </div>
            
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span>${PRICING_CONFIG.PACKAGES[selectedPackage].price.toFixed(2)}</span>
            </div>
            
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-frankiePurple hover:bg-frankiePurple-dark text-white"
            >
              {loading ? 'Processing...' : 'Pay with PayPal'}
            </Button>
            
            <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
              <Lock className="h-3 w-3 mr-1" />
              Secure payment processing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
