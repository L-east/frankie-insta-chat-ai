
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import PaymentPage from './PaymentPage';
import { getUserAgentsUsage } from '@/services/personaService';
import { PRICING_CONFIG } from '@/services/personaService';

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
          <div>
            <label className="text-sm font-medium text-gray-600">Account Type</label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={profile?.is_pro ? "default" : "secondary"}>
                {profile?.is_pro ? "Pro" : "Free"}
              </Badge>
            </div>
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
