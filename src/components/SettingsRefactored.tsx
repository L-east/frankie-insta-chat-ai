
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, CreditCard, Settings as SettingsIcon, Mail, HelpCircle, ChevronDown } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import PaymentPage from './PaymentPage';
import { getMessageCredits, PRICING_CONFIG } from '@/services/personaService';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface SettingsRefactoredProps {
  onBack: () => void;
}

const SettingsRefactored: React.FC<SettingsRefactoredProps> = ({ onBack }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [currentView, setCurrentView] = useState<'main' | 'payment'>('main');
  const [messageCredits, setMessageCredits] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchMessageCredits();
    }
  }, [user]);

  const fetchMessageCredits = async () => {
    try {
      const credits = await getMessageCredits();
      setMessageCredits(credits);
    } catch (error) {
      console.error('Error fetching message credits:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentView('main');
    fetchMessageCredits();
    refreshProfile();
  };

  if (currentView === 'payment') {
    return (
      <div className="h-full flex flex-col">
        <PaymentPage 
          onBack={() => setCurrentView('main')} 
          onSuccess={handlePaymentSuccess}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          <SettingsIcon className="h-5 w-5" />
          <h2 className="text-xl font-bold">Settings</h2>
        </div>
      </div>

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <div className="text-base">{user?.email || 'Not available'}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Display Name</label>
            <div className="text-base">{profile?.name || user?.email?.split('@')[0] || 'Not set'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Usage & Billing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Message Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messageCredits && (
            <>
              {/* Free Messages */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Free Messages</span>
                  <span className="text-sm text-gray-600">
                    {messageCredits.freeMessagesRemaining} / {PRICING_CONFIG.FREE_MESSAGES}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (messageCredits.freeMessagesRemaining / PRICING_CONFIG.FREE_MESSAGES) * 100)}%` 
                    }}
                  ></div>
                </div>
                {messageCredits.profile?.free_messages_expiry && !messageCredits.freeExpired && (
                  <div className="text-xs text-gray-500 mt-1">
                    Expires {new Date(messageCredits.profile.free_messages_expiry).toLocaleDateString()}
                  </div>
                )}
                {messageCredits.freeExpired && (
                  <div className="text-xs text-red-500 mt-1">
                    Free messages expired
                  </div>
                )}
              </div>

              {/* Purchased Messages */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Purchased Messages</span>
                  <span className="text-sm text-gray-600">
                    {messageCredits.paidMessagesRemaining}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-frankiePurple h-2 rounded-full" 
                    style={{ 
                      width: `${messageCredits.paidMessagesRemaining > 0 ? 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  No expiry on purchased messages
                </div>
              </div>

              {/* Total Available */}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Available</span>
                  <span className="font-medium text-lg">{messageCredits.totalAvailable}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Total Used</span>
                  <span>{messageCredits.totalUsed}</span>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Current Pricing</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• {PRICING_CONFIG.FREE_MESSAGES} free messages for new users</div>
                <div>• {PRICING_CONFIG.MESSAGE_PRICE_CENTS}¢ per message after free quota</div>
                <div>• Free messages expire in 30 days</div>
                <div>• Purchased messages never expire</div>
              </div>
            </div>
            
            <Button 
              onClick={() => setCurrentView('payment')}
              className="w-full bg-frankiePurple hover:bg-frankiePurple-dark"
            >
              Purchase More Messages
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                View FAQs
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div>
                <h3 className="font-medium mb-2">What are message credits?</h3>
                <p className="text-sm text-gray-600">
                  Message credits are used to power your AI personas. Each message sent by a persona consumes one credit.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">How do message credits work?</h3>
                <p className="text-sm text-gray-600">
                  You get 10 free messages that expire in 30 days. Free messages are used first, then purchased messages. Purchased messages never expire.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">How do I get more message credits?</h3>
                <p className="text-sm text-gray-600">
                  You can purchase additional message credits through our packages. Each package comes with a specific number of messages.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Contact Us Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Need help? Reach out to us at:</p>
          <p className="text-sm font-medium mt-2">alivefrankie@gmail.com</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsRefactored;
