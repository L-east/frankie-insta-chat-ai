import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, CreditCard, Settings as SettingsIcon, Mail, HelpCircle, ChevronDown } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import PaymentPage from './PaymentPage';
import { getUserAgentsUsage } from '@/services/personaService';
import { PRICING_CONFIG } from '@/services/personaService';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface SettingsRefactoredProps {
  onBack: () => void;
}

const SettingsRefactored: React.FC<SettingsRefactoredProps> = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [currentView, setCurrentView] = useState<'main' | 'payment'>('main');
  const [agentsUsage, setAgentsUsage] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchAgentsUsage();
    }
  }, [user]);

  const fetchAgentsUsage = async () => {
    try {
      const usageData = await getUserAgentsUsage();
      setAgentsUsage(usageData);
    } catch (error) {
      console.error('Error fetching agents usage:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentView('main');
    fetchAgentsUsage(); // Refresh usage data
  };

  const getMessageQuotaInfo = () => {
    if (!agentsUsage || !agentsUsage.free_messages_quota || !agentsUsage.free_messages_used) {
      return null;
    }

    const percentage = (agentsUsage.free_messages_used / agentsUsage.free_messages_quota) * 100;
    const daysLeft = Math.max(0, Math.ceil((new Date(agentsUsage.free_messages_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) - Math.floor(Date.now() / (1000 * 60 * 60 * 24)));

    return { percentage, daysLeft };
  };

  if (currentView === 'payment') {
    return (
      <PaymentPage 
        onBack={() => setCurrentView('main')} 
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
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
            Usage & Billing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {agentsUsage && (
            <>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Messages</span>
                  <span className="text-sm text-gray-600">
                    {agentsUsage.free_messages_used || 0} / {agentsUsage.free_messages_quota || PRICING_CONFIG.FREE_MESSAGES}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-frankiePurple h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, ((agentsUsage.free_messages_used || 0) / (agentsUsage.free_messages_quota || PRICING_CONFIG.FREE_MESSAGES)) * 100)}%` 
                    }}
                  ></div>
                </div>
                {agentsUsage.free_messages_expiry && (
                  <div className="text-xs text-gray-500 mt-1">
                    Expires in {Math.max(0, Math.ceil((new Date(agentsUsage.free_messages_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Agents Deployed</span>
                  <span className="text-sm text-gray-600">
                    {agentsUsage.free_agents_used || 0} / {agentsUsage.free_agents_total || 7}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, ((agentsUsage.free_agents_used || 0) / (agentsUsage.free_agents_total || 7)) * 100)}%` 
                    }}
                  ></div>
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
                <div>• Messages valid for {PRICING_CONFIG.MESSAGE_VALIDITY_DAYS} days</div>
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

      {/* Billing Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Billing</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Messages Used</span>
            <span className="text-sm font-medium">{agentsUsage?.free_messages_used || 0}/{agentsUsage?.free_messages_quota || PRICING_CONFIG.FREE_MESSAGES}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-frankiePurple h-1.5 rounded-full" 
              style={{ width: `${getMessageQuotaInfo()?.percentage || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Free messages reset in {getMessageQuotaInfo()?.daysLeft || 0} days</span>
            <span>{getMessageQuotaInfo()?.percentage || 0}% used</span>
          </div>
        </div>
      </div>

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
                  Message credits are used to power your AI agents. Each message sent by an agent consumes one credit. You get {PRICING_CONFIG.FREE_MESSAGES} free messages every month, and can purchase additional credits as needed.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">How do I get more message credits?</h3>
                <p className="text-sm text-gray-600">
                  You can purchase additional message credits through our packages. Each package comes with a specific number of messages that never expire.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Do message credits expire?</h3>
                <p className="text-sm text-gray-600">
                  Free monthly credits expire at the end of each month. Purchased message credits never expire and can be used anytime.
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
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Contact
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <p className="text-sm text-gray-600">Need help? Reach out to us at:</p>
              <p className="text-sm font-medium mt-2">alivefrankie@gmail.com</p>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
      </div>
    </div>
  );
};

export default SettingsRefactored;
