
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Settings, 
  CreditCard, 
  User, 
  Bell, 
  Shield, 
  HelpCircle 
} from "lucide-react";

interface SettingsVerticalProps {
  onBack: () => void;
}

const SettingsVertical: React.FC<SettingsVerticalProps> = ({ onBack }) => {
  return (
    <div className="flex h-full">
      <Tabs defaultValue="account" orientation="vertical" className="w-full flex">
        <TabsList className="flex flex-col h-full bg-gray-100 w-16 items-center pt-4 space-y-2">
          <TabsTrigger value="account" className="w-10 h-10 p-0 data-[state=active]:bg-frankiePurple data-[state=active]:text-white">
            <User size={18} />
          </TabsTrigger>
          <TabsTrigger value="billing" className="w-10 h-10 p-0 data-[state=active]:bg-frankiePurple data-[state=active]:text-white">
            <CreditCard size={18} />
          </TabsTrigger>
          <TabsTrigger value="notifications" className="w-10 h-10 p-0 data-[state=active]:bg-frankiePurple data-[state=active]:text-white">
            <Bell size={18} />
          </TabsTrigger>
          <TabsTrigger value="privacy" className="w-10 h-10 p-0 data-[state=active]:bg-frankiePurple data-[state=active]:text-white">
            <Shield size={18} />
          </TabsTrigger>
          <TabsTrigger value="help" className="w-10 h-10 p-0 data-[state=active]:bg-frankiePurple data-[state=active]:text-white">
            <HelpCircle size={18} />
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 p-4 overflow-auto">
          <TabsContent value="account" className="mt-0">
            <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
            <div className="space-y-4">
              {/* Account settings content would go here */}
              <p>Manage your account details and preferences.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="billing" className="mt-0">
            <h2 className="text-lg font-semibold mb-4">Billing & Subscriptions</h2>
            <div className="space-y-4">
              {/* Billing settings content would go here */}
              <p>Manage your subscription and payment methods.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
            <div className="space-y-4">
              {/* Notification settings content would go here */}
              <p>Control how and when you receive notifications.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="mt-0">
            <h2 className="text-lg font-semibold mb-4">Privacy & Security</h2>
            <div className="space-y-4">
              {/* Privacy settings content would go here */}
              <p>Manage your privacy settings and security preferences.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="help" className="mt-0">
            <h2 className="text-lg font-semibold mb-4">Help & Support</h2>
            <div className="space-y-4">
              {/* Help content would go here */}
              <p>Get help with Frankie AI and find answers to common questions.</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsVertical;
