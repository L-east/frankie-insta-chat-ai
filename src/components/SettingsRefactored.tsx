
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, CreditCard, Settings as SettingsIcon, HelpCircle, Mail } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import PaymentPage from './PaymentPage';
import { getUserAgentsUsage } from '@/services/personaService';
import { PRICING_CONFIG } from '@/services/personaService';

interface SettingsRefactoredProps {
  onBack: () => void;
}

const SettingsRefactored: React.FC<SettingsRefactoredProps> = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [currentView, setCurrentView] = useState<'main' | 'payment' | 'faq' | 'contact'>('main');
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
    fetchAgentsUsage();
  };

  if (currentView === 'payment') {
    return (
      <PaymentPage 
        onBack={() => setCurrentView('main')} 
        onSuccess={handlePaymentSuccess}
      />
    );
  }

  if (currentView === 'faq') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How does Frankie AI work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Frankie AI deploys AI personas that can handle your Instagram conversations. Simply click "Deploy Frankie" in any chat to select a persona.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What are the different personas?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">We offer 5 unique personas: Casanova (romantic), Cleopatra (regal), Gentleman (polite), Funny Guy (humorous), and Icebreaker (social catalyst).</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How much does it cost?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">New users get {PRICING_CONFIG.FREE_MESSAGES} free messages. After that, messages cost {PRICING_CONFIG.MESSAGE_PRICE_CENTS} cents each and are valid for {PRICING_CONFIG.MESSAGE_VALIDITY_DAYS} days.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is my data secure?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Yes, we take privacy seriously. Your conversations are processed securely and we don't store personal chat content beyond what's necessary for the service.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === 'contact') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => setCurrentView('main')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <h2 className="text-xl font-bold">Contact Us</h2>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Email Support</h4>
              <p className="text-gray-600">support@frankieai.com</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Business Inquiries</h4>
              <p className="text-gray-600">business@frankieai.com</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Response Time</h4>
              <p className="text-gray-600">We typically respond within 24 hours on business days.</p>
            </div>
          </CardContent>
        </Card>
      </div>
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
                  <span className="text-sm font-medium">Messages Remaining</span>
                  <span className="text-sm text-gray-600">
                    {Math.max(0, (agentsUsage.free_messages_quota || PRICING_CONFIG.FREE_MESSAGES) - (agentsUsage.free_messages_used || 0))} / {agentsUsage.free_messages_quota || PRICING_CONFIG.FREE_MESSAGES}
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

      {/* FAQ and Contact Section */}
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => setCurrentView('faq')}
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Frequently Asked Questions
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => setCurrentView('contact')}
        >
          <Mail className="h-4 w-4 mr-2" />
          Contact Us
        </Button>
      </div>

      {/* App Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-500 space-y-1">
            <div>Frankie AI Chrome Extension</div>
            <div>Version 1.0.0</div>
            <div>© 2025 Frankie AI</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsRefactored;
