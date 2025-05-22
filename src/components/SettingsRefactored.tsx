import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, User, Bell, CreditCard, HelpCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/store/authStore';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface SettingsRefactoredProps {
  onBack: () => void;
}

const SettingsRefactored = ({ onBack }: SettingsRefactoredProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const { profile } = useAuth();
  
  // State for notifications
  const [notifications, setNotifications] = useState({
    deploymentCompleted: true,
    agentPaused: true
  });
  
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    account: true,
    pricing: false,
    notifications: false,
    help: false
  });

  // State for password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State for showing contact email
  const [showContactEmail, setShowContactEmail] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handleNotificationChange = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      toast({
        title: "Password update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronDown className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>
      
      <div className="space-y-4">
        {/* Account Details Section */}
        <Collapsible
          open={expandedSections.account}
          onOpenChange={() => toggleSection('account')}
          className="border rounded-md"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left font-medium">
            <div className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              <span>Account Details</span>
            </div>
            {expandedSections.account ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0 border-t">
            {isAuthenticated ? (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input 
                      id="name" 
                      type="text"
                      value={profile?.name || ''}
                      onChange={(e) => {
                        // Update display name in backend
                        if (user) {
                          supabase
                            .from('profiles')
                            .update({ name: e.target.value })
                            .eq('id', user.id)
                            .then(({ error }) => {
                              if (error) {
                                toast({
                                  title: "Error updating name",
                                  description: error.message,
                                  variant: "destructive"
                                });
                              } else {
                                toast({
                                  title: "Name updated",
                                  description: "Your display name has been updated successfully"
                                });
                              }
                            });
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 mb-6 border-t border-b py-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Change Password</h4>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                    >
                      {showPasswordChange ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  
                  {showPasswordChange && (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input 
                          id="current-password" 
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input 
                          id="new-password" 
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Update Password
                      </Button>
                    </form>
                  )}
                </div>
                
                <div className="py-4 space-y-2">
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
                        onClick={() => toggleSection('pricing')}
                      >
                        Upgrade
                      </Button>
                    )}
                  </div>
                  
                  {!user?.isPro && user?.freeExpiryDate && (
                    <div className="text-sm text-frankieGray">
                      Free tier: {user.freeAgentsUsed}/{user.freeAgentsTotal} agent deployments, valid for {Math.max(0, Math.ceil((new Date(user.freeExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} more days.
                    </div>
                  )}
                </div>
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
          </CollapsibleContent>
        </Collapsible>
        
        {/* Pricing Section */}
        <Collapsible
          open={expandedSections.pricing}
          onOpenChange={() => toggleSection('pricing')}
          className="border rounded-md"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left font-medium">
            <div className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              <span>Pricing</span>
            </div>
            {expandedSections.pricing ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0 border-t">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Feature</th>
                    <th className="border p-2 text-left">Free Tier</th>
                    <th className="border p-2 text-left">Pro Subscription</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">Personas</td>
                    <td className="border p-2">Limited</td>
                    <td className="border p-2">Unlock Advance personas</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Agents Limit</td>
                    <td className="border p-2">Create & Deploy 7 agents</td>
                    <td className="border p-2">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Agents Lifespan</td>
                    <td className="border p-2">30 min</td>
                    <td className="border p-2">24 hours</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Run in Background</td>
                    <td className="border p-2">No</td>
                    <td className="border p-2">Yes</td>
                  </tr>
                  <tr>
                    <td className="border p-2">Run Parallely</td>
                    <td className="border p-2">No</td>
                    <td className="border p-2">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              {!user?.isPro && (
                <Button 
                  className="w-full bg-frankiePurple hover:bg-frankiePurple-dark"
                  onClick={() => {
                    // Redirect to payment page
                  }}
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {/* Notifications Section */}
        <Collapsible
          open={expandedSections.notifications}
          onOpenChange={() => toggleSection('notifications')}
          className="border rounded-md"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left font-medium">
            <div className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              <span>Notifications</span>
            </div>
            {expandedSections.notifications ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0 border-t">
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
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {/* Help Section */}
        <Collapsible
          open={expandedSections.help}
          onOpenChange={() => toggleSection('help')}
          className="border rounded-md"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left font-medium">
            <div className="flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              <span>Help</span>
            </div>
            {expandedSections.help ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 pt-0 border-t">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">FAQs</h4>
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
                      Yes, you can add custom instructions to guide your agent's behavior.
                    </p>
                  </details>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Contact Us</h4>
                <p className="text-sm text-frankieGray mb-2">
                  Need help or have questions? Get in touch with our support team.
                </p>
                {!showContactEmail ? (
                  <Button 
                    variant="outline" 
                    className="text-frankiePurple border-frankiePurple"
                    onClick={() => setShowContactEmail(true)}
                  >
                    Contact Support
                  </Button>
                ) : (
                  <div className="p-2 bg-gray-100 rounded text-center">
                    alivefrankie@gmail.com
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default SettingsRefactored;
