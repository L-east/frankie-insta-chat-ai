import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Settings as SettingsIcon, User, Bell, Shield, CreditCard, HelpCircle, MessageCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/store/authStore';

interface SettingsProps {
  onBack: () => void;
}

const Settings = ({ onBack }: SettingsProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const { profile } = useAuth();
  
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
              label="FAQ" 
              isActive={activeTab === 'faq'} 
              onClick={() => setActiveTab('faq')} 
            />
            <TabButton 
              icon={<MessageCircle size={16} />}
              label="Contact Us" 
              isActive={activeTab === 'contact'} 
              onClick={() => setActiveTab('contact')} 
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
              <h3 className="text-lg font-medium mb-4">Message Credits</h3>
              
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div>
                    <div className="font-medium">Remaining Messages</div>
                    <div className="text-lg">{user?.freeMessagesQuota - (user?.freeMessagesUsed || 0)} messages</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-xl font-bold">10</div>
                      <div className="text-sm text-frankieGray">messages</div>
                      <div className="text-lg font-semibold mt-2">$1.00</div>
                      <Button className="w-full mt-4">Purchase</Button>
                      </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-xl font-bold">50</div>
                      <div className="text-sm text-frankieGray">messages</div>
                      <div className="text-lg font-semibold mt-2">$5.00</div>
                      <Button className="w-full mt-4">Purchase</Button>
                      </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-xl font-bold">100</div>
                      <div className="text-sm text-frankieGray">messages</div>
                      <div className="text-lg font-semibold mt-2">$10.00</div>
                      <Button className="w-full mt-4">Purchase</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="mb-4 text-frankieGray">Please log in to view your message credits</p>
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
          
          {activeTab === 'faq' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Frequently Asked Questions</h3>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">What is Frankie AI?</h4>
                  <p className="text-frankieGray">Frankie AI is an AI-powered chat assistant that helps you manage your Instagram conversations.</p>
                </div>
                
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">How do message credits work?</h4>
                  <p className="text-frankieGray">You get 10 free messages when you sign up. After that, you can purchase message packages to continue using the service. Each message costs 10 cents.</p>
                </div>
                
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">How do I purchase more messages?</h4>
                  <p className="text-frankieGray">Go to the Billing section and choose from our available message packages.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Contact Us</h3>
              
              <div className="space-y-4">
                <p className="text-frankieGray">
                  Have questions or need help? Reach out to our support team.
                </p>
                
                <div className="space-y-2">
                  <div className="font-medium">Email Support</div>
                  <p className="text-frankieGray">support@frankieai.com</p>
                </div>
                
                  <div className="space-y-2">
                  <div className="font-medium">Response Time</div>
                  <p className="text-frankieGray">We typically respond within 24 hours during business days.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
        isActive 
          ? 'bg-frankiePurple text-white' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default Settings;
