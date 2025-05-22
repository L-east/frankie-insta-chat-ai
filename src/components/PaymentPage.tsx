
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, CreditCard, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { MESSAGE_PACKAGES } from '@/services/personaService';

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
  const [selectedPackage, setSelectedPackage] = useState<number>(2); // Default to 100 messages
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
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  useEffect(() => {
    if (paypalLoaded && window.paypal) {
      window.paypal.Buttons({
        createOrder: function(data: any, actions: any) {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: MESSAGE_PACKAGES[selectedPackage].price.toFixed(2)
              },
              description: `Frankie AI ${MESSAGE_PACKAGES[selectedPackage].count} Messages`
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
              // Type assertion to access from correctly
              const { error } = await supabase.from("transactions").insert({
                user_id: user.id,
                payment_provider: 'paypal',
                payment_id: orderDetails.id,
                amount: MESSAGE_PACKAGES[selectedPackage].price,
                currency: 'USD',
                messages_purchased: MESSAGE_PACKAGES[selectedPackage].count,
                status: 'completed'
              });
              
              if (error) throw error;
            }
            
            toast({
              title: "Payment successful!",
              description: `You now have ${MESSAGE_PACKAGES[selectedPackage].count} additional messages.`,
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
  }, [paypalLoaded, selectedPackage, user, onSuccess]);

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Purchase Frankie AI Messages</h1>
        <p className="text-gray-600">Messages are valid for 30 days from purchase</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left column - Plan details */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg border mb-6">
            <h2 className="text-lg font-bold mb-4">Choose your message package</h2>
            
            <RadioGroup 
              value={selectedPackage.toString()} 
              onValueChange={(value) => setSelectedPackage(parseInt(value))}
              className="space-y-4"
            >
              {MESSAGE_PACKAGES.map((pkg, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 ${
                    selectedPackage === index ? 'border-frankiePurple bg-frankiePurple/5' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start">
                    <RadioGroupItem value={index.toString()} id={`pkg-${index}`} className="mt-1" />
                    <div className="ml-3">
                      <Label htmlFor={`pkg-${index}`} className="font-medium">{pkg.count} Messages</Label>
                      <div className="text-lg font-bold">${pkg.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Valid for 30 days</div>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
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
                <span>Package</span>
                <span>{MESSAGE_PACKAGES[selectedPackage].count} Messages</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg mb-4">
                <span>Total</span>
                <span>${MESSAGE_PACKAGES[selectedPackage].price.toFixed(2)}</span>
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
      
      <div className="mt-8 space-y-4">
        <h3 className="font-medium">Why purchase messages?</h3>
        <div className="space-y-2">
          <BenefitItem text="Deploy personalized AI agents to chat on your behalf" />
          <BenefitItem text="Save time while maintaining authentic conversations" />
          <BenefitItem text="Each message package gives you full access to all personas" />
          <BenefitItem text="Messages can be used across any chat platform" />
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
