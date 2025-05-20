
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader } from "lucide-react";
import { Persona } from "@/store/personaStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/use-toast";
import { createPersonaDeployment, incrementAgentUsed } from '@/services/personaService';

interface PersonaDetailProps {
  persona: Persona;
  onBack: () => void;
  onOpenAuth: () => void;
}

const PersonaDetail = ({ persona, onBack, onOpenAuth }: PersonaDetailProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Form state
  const [customInstructions, setCustomInstructions] = useState('');
  const [timeLimit, setTimeLimit] = useState('30');
  const [timeLimitUnit, setTimeLimitUnit] = useState<'minutes' | 'hours'>('minutes');
  const [messageCount, setMessageCount] = useState('10');
  const [mode, setMode] = useState<'auto'|'manual'>('auto');

  const handleDeploy = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    
    setIsDeploying(true);
    
    try {
      // Convert time limit to minutes
      const timeLimitInMinutes = timeLimitUnit === 'hours' 
        ? parseInt(timeLimit) * 60 
        : parseInt(timeLimit);
      
      // Create deployment data
      const deploymentData = {
        persona_id: persona.id,
        scope: 'current',
        mode,
        custom_prompt: customInstructions,
        time_limit: timeLimitInMinutes,
        message_count: parseInt(messageCount),
        flag_keywords: [], // Empty since we're not using this for now
        flag_action: 'pause'
      };
      
      // Create persona deployment in backend
      await createPersonaDeployment(deploymentData);
      
      // Increment agent usage
      await incrementAgentUsed();
      
      // Send message to content script to deploy agent
      if (window.parent) {
        window.parent.postMessage({
          action: 'deployAgent',
          config: {
            ...deploymentData,
            persona,
            chatData: { chatId: 'current-chat' } // This will be replaced by the content script
          }
        }, '*');
      }
      
      toast({
        title: `${persona.name} deployed!`,
        description: "Your AI agent is now active in the chat.",
      });
    } catch (error) {
      console.error('Error deploying agent:', error);
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const getMaxTimeLimit = () => {
    if (!user?.isPro) {
      return 30; // 30 minutes for free users
    }
    return timeLimitUnit === 'hours' ? 24 : 24 * 60; // 24 hours for pro users
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
            <img 
              src={persona.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} 
              alt={persona.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{persona.name}</h2>
              <Badge className={persona.isPremium ? "bg-amber-400 text-black" : "bg-frankiePurple"}>
                {persona.isPremium ? "PRO" : "FREE"}
              </Badge>
            </div>
            <p className="text-frankieGray text-sm">{persona.behaviorSnapshot}</p>
          </div>
        </div>
      </div>

      {/* Configuration sections */}
      <div className="space-y-4">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions for {persona.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder={`Add custom instructions for ${persona.name}...`}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Session Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time-limit">Time Limit</Label>
                <div className="flex gap-2">
                  <Input 
                    id="time-limit" 
                    placeholder="e.g. 30"
                    type="number" 
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    min="1"
                    max={getMaxTimeLimit().toString()}
                    className="flex-1"
                  />
                  {user?.isPro && (
                    <Select 
                      value={timeLimitUnit}
                      onValueChange={(value: 'minutes' | 'hours') => setTimeLimitUnit(value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                {!user?.isPro && (
                  <p className="text-xs text-gray-500 mt-1">Free tier: Max 30 minutes</p>
                )}
              </div>
              <div>
                <Label htmlFor="message-count">Message Count</Label>
                <Input 
                  id="message-count" 
                  placeholder="e.g. 10"
                  type="number"
                  value={messageCount}
                  onChange={(e) => setMessageCount(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            
            <fieldset>
              <legend className="text-sm font-medium mb-2">Mode</legend>
              <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'auto'|'manual')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="auto" />
                  <Label htmlFor="auto">Automated (agent sends automatically)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual">Manual (agent drafts, you send)</Label>
                </div>
              </RadioGroup>
            </fieldset>
            
            {/* Usage Counter */}
            {isAuthenticated && !user?.isPro && user?.freeExpiryDate && (
              <div className="text-xs text-frankieGray mt-4">
                You've deployed {user?.freeAgentsUsed}/{user?.freeAgentsTotal} free agents. 
                Expires in {Math.max(0, Math.ceil((new Date(user.freeExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Cancel</Button>
        <Button 
          onClick={handleDeploy} 
          disabled={isDeploying}
          className="bg-frankiePurple hover:bg-frankiePurple-dark"
        >
          {isDeploying ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Deploying...
            </>
          ) : !isAuthenticated ? (
            "Log in to Deploy"
          ) : (
            "Save & Deploy"
          )}
        </Button>
      </div>
    </div>
  );
};

export default PersonaDetail;
