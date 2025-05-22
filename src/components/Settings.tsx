
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Settings as SettingsIcon, User, Bell, Shield, CreditCard, HelpCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/store/authStore';
import SettingsVertical from './SettingsVertical';

interface SettingsProps {
  onBack: () => void;
}

const Settings = ({ onBack }: SettingsProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const { profile } = useAuth(); // Removed updateUserProfile as it doesn't exist
  
  // State for settings
  const [notifications, setNotifications] = useState({
    deploymentCompleted: true,
    agentPaused: true,
    emailUpdates: false
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('account');
  
  const handleNotificationChange = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Updated to use vertical tab navigation
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>
      
      <div className="flex">
        {/* Vertical tab navigation */}
        <div className="w-1/4 border-r pr-4">
          <nav className="space-y-1">
            <TabButton 
              icon={<User size={16} />}
              label="Account" 
              isActive={activeTab === 'account'} 
              onClick={() => setActiveTab('account')} 
            />
            <TabButton 
              icon={<Bell size={16} />}
              label="Notifications" 
              isActive={activeTab === 'notifications'} 
              onClick={() => setActiveTab('notifications')} 
            />
            <TabButton 
              icon={<Shield size={16} />}
              label="Privacy" 
              isActive={activeTab === 'privacy'} 
              onClick={() => setActiveTab('privacy')} 
            />
            <TabButton 
              icon={<CreditCard size={16} />}
              label="Billing" 
              isActive={activeTab === 'billing'} 
              onClick={() => setActiveTab('billing')} 
            />
            <TabButton 
              icon={<HelpCircle size={16} />}
              label="Help" 
              isActive={activeTab === 'help'} 
              onClick={() => setActiveTab('help')} 
            />
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="w-3/4 pl-6">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Account Settings</h3>
              
              {isAuthenticated ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="p-2 bg-gray-100 rounded text-gray-800" id="email">
                        {user?.email}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <div className="p-2 bg-gray-100 rounded text-gray-800" id="name">
                        {profile?.name || 'Not set'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-4 border-t border-b space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Account Type</p>
                        <p className="text-sm text-frankieGray">
                          {user?.isPro ? 'Pro Account' : 'Free Account'}
                        </p>
                      </div>
                      
                      {!user?.isPro && (
                        <Button 
                          className="bg-frankiePurple hover:bg-frankiePurple-dark"
                          onClick={() => {
                            // This would redirect to upgrade page
                          }}
                        >
                          Upgrade
                        </Button>
                      )}
                    </div>
                    
                    {!user?.isPro && (
                      <div className="text-sm text-frankieGray">
                        Free tier: 7 agent deployments, valid for {Math.max(0, Math.ceil((new Date(user?.freeExpiryDate || Date.now()).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} more days.
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-red-300 text-red-500 hover:bg-red-50"
                    onClick={() => {
                      // This would trigger logout
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="mb-4 text-frankieGray">You're not logged in</p>
                  <Button 
                    className="bg-frankiePurple hover:bg-frankiePurple-dark"
                    onClick={() => {
                      // This would trigger login modal
                    }}
                  >
                    Log in
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="deployment-completed" className="flex-1">
                    Agent deployment completed
                  </Label>
                  <Switch 
                    id="deployment-completed" 
                    checked={notifications.deploymentCompleted}
                    onCheckedChange={() => handleNotificationChange('deploymentCompleted')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="agent-paused" className="flex-1">
                    Agent paused (due to flagged content)
                  </Label>
                  <Switch 
                    id="agent-paused" 
                    checked={notifications.agentPaused}
                    onCheckedChange={() => handleNotificationChange('agentPaused')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-updates" className="flex-1">
                    Email updates about new features
                  </Label>
                  <Switch 
                    id="email-updates" 
                    checked={notifications.emailUpdates}
                    onCheckedChange={() => handleNotificationChange('emailUpdates')}
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
              
              <p className="text-frankieGray">
                Frankie AI values your privacy. We collect minimal data to provide you with the best experience.
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="data-collection" className="flex-1">
                    Allow anonymous usage data collection
                  </Label>
                  <Switch 
                    id="data-collection" 
                    checked={true}
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Billing Information</h3>
              
              {isAuthenticated && user?.isPro ? (
                <div className="space-y-4">
                  <div>
                    <div className="font-medium">Current Plan</div>
                    <div className="text-lg">Pro Plan - $9.99/month</div>
                    <div className="text-sm text-frankieGray">Next billing date: June 15, 2025</div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="font-medium mb-2">Payment Method</div>
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded mr-2">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div>**** **** **** 4242</div>
                        <div className="text-sm text-frankieGray">Expires 12/28</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <Button variant="outline">Update Payment</Button>
                    <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50">
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="font-medium">Current Plan</div>
                    <div className="text-lg">Free Tier</div>
                    <ul className="list-disc list-inside text-sm text-frankieGray mt-2">
                      <li>Up to 7 agent deployments</li>
                      <li>Valid for 7 days from account creation</li>
                      <li>Basic personas only</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border mt-6">
                    <div className="font-bold text-lg mb-2">Upgrade to Pro</div>
                    <ul className="list-disc list-inside text-sm mb-4">
                      <li>Unlimited agent deployments</li>
                      <li>All premium personas</li>
                      <li>Priority support</li>
                      <li>Advanced configuration options</li>
                    </ul>
                    <Button className="w-full bg-frankiePurple hover:bg-frankiePurple-dark">
                      Upgrade for $9.99/month
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'help' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Help & Support</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Documentation</h4>
                  <p className="text-sm text-frankieGray mb-2">
                    Check our comprehensive documentation to learn how to use Frankie AI effectively.
                  </p>
                  <Button variant="outline" className="text-frankiePurple border-frankiePurple">
                    View Documentation
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Contact Support</h4>
                  <p className="text-sm text-frankieGray mb-2">
                    Having issues or questions? Our support team is ready to help.
                  </p>
                  <Button variant="outline" className="text-frankiePurple border-frankiePurple">
                    Contact Support
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">FAQ</h4>
                  <div className="space-y-2">
                    <details className="text-sm">
                      <summary className="font-medium cursor-pointer">How do I deploy an agent?</summary>
                      <p className="mt-2 ml-4 text-frankieGray">
                        Navigate to an Instagram chat, click the "Deploy Frankie" button next to the text input area, and follow the configuration steps.
                      </p>
                    </details>
                    <details className="text-sm">
                      <summary className="font-medium cursor-pointer">What's the difference between auto and manual mode?</summary>
                      <p className="mt-2 ml-4 text-frankieGray">
                        Auto mode allows the agent to send messages automatically. Manual mode lets you review messages before sending them.
                      </p>
                    </details>
                    <details className="text-sm">
                      <summary className="font-medium cursor-pointer">Can I customize the agent's behavior?</summary>
                      <p className="mt-2 ml-4 text-frankieGray">
                        Yes, you can add custom instructions, adjust tone strength, and set up trigger keywords to guide your agent's behavior.
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Tab button component
const TabButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => {
  return (
    <button
      className={`flex items-center w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
        isActive 
          ? 'bg-frankiePurple/10 text-frankiePurple font-medium' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
};

export default Settings;
