
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PRICING_CONFIG } from '@/services/personaService';

interface PaymentPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onBack, onSuccess }) => {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackage(pkg);
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful!",
        description: `${selectedPackage.count} messages have been added to your account.`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <h2 className="text-xl font-bold">Purchase Messages</h2>
        </div>
      </div>

      <div className="grid gap-4">
        {PRICING_CONFIG.PACKAGES.map((pkg, index) => (
          <Card 
            key={index}
            className={`cursor-pointer transition-all ${
              selectedPackage?.count === pkg.count 
                ? 'ring-2 ring-frankiePurple bg-frankiePurple/5' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handlePackageSelect(pkg)}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{pkg.count} Messages</h3>
                  <p className="text-gray-600">${pkg.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {(pkg.price / pkg.count * 100).toFixed(1)}¢ per message
                  </p>
                </div>
                <div className="flex items-center">
                  {selectedPackage?.count === pkg.count && (
                    <Check className="h-6 w-6 text-frankiePurple" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Button 
          onClick={handlePayment}
          disabled={!selectedPackage || isProcessing}
          className="w-full bg-frankiePurple hover:bg-frankiePurple-dark"
        >
          {isProcessing ? 'Processing...' : `Pay $${selectedPackage?.price?.toFixed(2) || '0.00'}`}
        </Button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Payment Information</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Free messages expire in 30 days</li>
          <li>• Purchased messages never expire</li>
          <li>• Free messages are used first</li>
          <li>• Secure payment processing</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentPage;
