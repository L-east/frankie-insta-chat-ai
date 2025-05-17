
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/use-toast";

interface SettingsProps {
  onBack: () => void;
}

const Settings = ({ onBack }: SettingsProps) => {
  const { user, isAuthenticated } = useAuthStore();
  
  // General settings
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [language, setLanguage] = useState("english");
  
  // Notification settings
  const [flagAlerts, setFlagAlerts] = useState("email");
  const [monthlySummary, setMonthlySummary] = useState(true);
  
  const handleSave = () => {
    // Save settings logic would go here
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
    onBack();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing & Plan</TabsTrigger>
          <TabsTrigger value="help">Help & Legal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="watermark-toggle" className="font-medium">AI Watermark</Label>
                    <p className="text-frankieGray text-sm">Tag responses with "Written by AI"</p>
                  </div>
                  <Switch 
                    id="watermark-toggle" 
                    checked={watermarkEnabled}
                    onCheckedChange={setWatermarkEnabled}
                    disabled={!isAuthenticated || !user?.isPro}
                  />
                </div>
                
                {!isAuthenticated || !user?.isPro ? (
                  <div className="text-xs text-frankieGray">
                    This feature is only available for Pro subscribers
                  </div>
                ) : null}
                
                <div className="space-y-2">
                  <Label htmlFor="language-select">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="flag-alerts" className="font-medium">Flag Alerts</Label>
                  <RadioGroup id="flag-alerts" value={flagAlerts} onValueChange={setFlagAlerts}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="push" id="push" />
                      <Label htmlFor="push">Desktop push</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none">None</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="summary-toggle" className="font-medium">Monthly Usage Summary</Label>
                    <p className="text-frankieGray text-sm">Receive a monthly email with your usage statistics</p>
                  </div>
                  <Switch 
                    id="summary-toggle" 
                    checked={monthlySummary}
                    onCheckedChange={setMonthlySummary}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Current Plan</h3>
                    <p className="text-frankiePurple font-bold text-lg">
                      {user?.isPro ? 'Pro' : 'Free Tier'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-frankieGray">Signup Date:</span>
                      <span>May 10, 2025</span>
                    </div>
                    
                    {!user?.isPro ? (
                      <div className="flex justify-between">
                        <span className="text-frankieGray">Free Tier Expires:</span>
                        <span>{user?.freeExpiryDate.toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-frankieGray">Next Billing Date:</span>
                        <span>June 10, 2025</span>
                      </div>
                    )}
                  </div>
                  
                  {!user?.isPro && (
                    <Button className="w-full bg-frankiePurple hover:bg-frankiePurple-dark">
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p>Please log in to view your billing information</p>
                  <Button className="mt-2">Log In</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Frequently Asked Questions</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-frankiePurple hover:underline">Why was I blocked?</a>
                  </li>
                  <li>
                    <a href="#" className="text-frankiePurple hover:underline">How do I cancel my subscription?</a>
                  </li>
                  <li>
                    <a href="#" className="text-frankiePurple hover:underline">Can I use multiple personas at once?</a>
                  </li>
                  <li>
                    <a href="#" className="text-frankiePurple hover:underline">What data do you collect?</a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Legal Information</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-frankiePurple hover:underline">Terms of Service</a>
                  </li>
                  <li>
                    <a href="#" className="text-frankiePurple hover:underline">Privacy Policy</a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Cancel</Button>
        <Button onClick={handleSave} className="bg-frankiePurple hover:bg-frankiePurple-dark">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
