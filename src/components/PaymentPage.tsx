
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CheckCircle, CreditCard, Lock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PaymentPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onBack, onSuccess }) => {
  const [plan, setPlan] = useState<'monthly'|'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    }
    
    // Format expiry date with slash
    if (name === 'expiry') {
      const expiry = value.replace(/\//g, '');
      if (expiry.length > 2) {
        formattedValue = expiry.slice(0, 2) + '/' + expiry.slice(2, 4);
      } else {
        formattedValue = expiry;
      }
    }
    
    // Format CVC to max 3 digits
    if (name === 'cvc') {
      formattedValue = value.slice(0, 3);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.cardNumber || !formData.cardName || !formData.expiry || !formData.cvc) {
      toast({
        title: "Missing information",
        description: "Please fill in all payment details.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      
      // Show success message
      toast({
        title: "Payment successful!",
        description: `You are now subscribed to the Frankie AI ${plan === 'monthly' ? 'Monthly' : 'Annual'} Plan.`,
      });
      
      // Call success callback
      onSuccess();
    }, 2000);
  };
  
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
              <BenefitItem text="Access to all premium personas" />
              <BenefitItem text="Advanced customization options" />
              <BenefitItem text="Priority support" />
              <BenefitItem text="No ads or branding" />
            </div>
          </div>
        </div>
        
        {/* Right column - Payment form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Payment Details</h2>
                <CreditCard className="text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input 
                    id="cardNumber" 
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456" 
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input 
                    id="cardName" 
                    name="cardName"
                    placeholder="John Smith" 
                    value={formData.cardName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input 
                      id="expiry" 
                      name="expiry"
                      placeholder="MM/YY" 
                      value={formData.expiry}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input 
                      id="cvc" 
                      name="cvc"
                      placeholder="123" 
                      value={formData.cvc}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
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
              
              <Button 
                type="submit" 
                className="w-full bg-frankiePurple hover:bg-frankiePurple-dark h-12"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Subscribe for ${getPrice()}`}
              </Button>
              
              <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
                <Lock className="h-3 w-3 mr-1" />
                Secure payment processing
              </div>
            </div>
          </form>
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
