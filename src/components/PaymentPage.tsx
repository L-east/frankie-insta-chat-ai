
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CheckCircle, CreditCard, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PaymentPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onBack, onSuccess }) => {
  const [plan, setPlan] = useState<'monthly'|'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const { user } = useAuthStore();
  
  useEffect(() => {
    // Load PayPal script
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=test&currency=USD";
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  useEffect(() => {
    if (paypalLoaded && window.paypal) {
      window.paypal.Buttons({
        createOrder: function(data: any, actions: any) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: plan === 'monthly' ? '9.99' : '99.99'
              },
              description: `Frankie AI ${plan === 'monthly' ? 'Monthly' : 'Annual'} Subscription`
            }]
          });
        },
        onApprove: async function(data: any, actions: any) {
          setLoading(true);
          try {
            // Get order details
            const orderDetails = await actions.order.capture();
            
            // Record transaction in Supabase
            if (user) {
              await supabase.from('transactions').insert({
                user_id: user.id,
                payment_provider: 'paypal',
                payment_id: orderDetails.id,
                amount: plan === 'monthly' ? 9.99 : 99.99,
                currency: 'USD',
                plan_type: plan,
                status: 'completed'
              });
              
              // Update user profile to pro
              await supabase.from('profiles').update({
                is_pro: true
              }).eq('id', user.id);
            }
            
            toast({
              title: "Payment successful!",
              description: `You are now subscribed to the Frankie AI ${plan === 'monthly' ? 'Monthly' : 'Annual'} Plan.`,
            });
            
            onSuccess();
          } catch (error) {
            console.error('Payment processing error:', error);
            toast({
              title: "Payment processing error",
              description: "There was an issue processing your payment. Please try again.",
              variant: "destructive"
            });
          } finally {
            setLoading(false);
          }
        }
      }).render('#paypal-button-container');
    }
  }, [paypalLoaded, plan, user, onSuccess]);

  const getPrice = () => {
    return plan === 'monthly' ? '$9.99/month' : '$99.99/year';
  };
  
  const getSavings = () => {
    return plan === 'annual' ? 'Save $19.89 (17%)' : null;
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Upgrade to Frankie AI Pro</h1>
        <p className="text-gray-600">Unleash the full potential of AI-powered conversations</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column - Plan details */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg border mb-6">
            <h2 className="text-lg font-bold mb-4">Choose your plan</h2>
            
            <RadioGroup value={plan} onValueChange={(value) => setPlan(value as 'monthly'|'annual')}>
              <div className="space-y-4">
                <div className={`border rounded-lg p-4 ${plan === 'monthly' ? 'border-frankiePurple bg-frankiePurple/5' : 'border-gray-200'}`}>
                  <div className="flex items-start">
                    <RadioGroupItem value="monthly" id="monthly" className="mt-1" />
                    <div className="ml-3">
                      <Label htmlFor="monthly" className="font-medium">Monthly Plan</Label>
                      <div className="text-lg font-bold">$9.99/month</div>
                      <div className="text-sm text-gray-500">Billed monthly</div>
                    </div>
                  </div>
                </div>
                
                <div className={`border rounded-lg p-4 ${plan === 'annual' ? 'border-frankiePurple bg-frankiePurple/5' : 'border-gray-200'}`}>
                  <div className="flex items-start">
                    <RadioGroupItem value="annual" id="annual" className="mt-1" />
                    <div className="ml-3">
                      <Label htmlFor="annual" className="font-medium">Annual Plan</Label>
                      <div className="text-lg font-bold">$99.99/year</div>
                      <div className="text-sm text-gray-500">Billed annually (save 17%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Pro Benefits:</h3>
            <div className="space-y-2">
              <BenefitItem text="Unlimited agent deployments" />
              <BenefitItem text="Advanced persona customization" />
              <BenefitItem text="Extended 24-hour agent lifespan" />
              <BenefitItem text="Background operation" />
              <BenefitItem text="Parallel agent execution" />
            </div>
          </div>
        </div>
        
        {/* Right column - Payment options */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg border mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Payment Details</h2>
              <CreditCard className="text-gray-400" />
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>{getPrice()}</span>
              </div>
              
              {getSavings() && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Savings</span>
                  <span>{getSavings()}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>{getPrice()}</span>
              </div>
              
              <div id="paypal-button-container" className="mt-4"></div>
              
              <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
                <Lock className="h-3 w-3 mr-1" />
                Secure payment processing
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Benefit item component
const BenefitItem = ({ text }: { text: string }) => (
  <div className="flex items-center">
    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

export default PaymentPage;
