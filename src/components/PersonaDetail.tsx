import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader } from "lucide-react";
import { Persona } from "@/store/personaStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/use-toast";
import { createPersonaDeployment, incrementAgentUsed, incrementMessageUsed } from '@/services/personaService';

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
  const [timeLimit, setTimeLimit] = useState('60');
  const [messageCount, setMessageCount] = useState('1');
  const [mode, setMode] = useState<'auto'|'manual'>('auto');

  const handleDeploy = async () => {
    // Validate time limit
    const timeLimitNum = parseInt(timeLimit || "60");
    if (timeLimitNum > 240) {
      toast({
        title: "Invalid time limit",
        description: "Time limit cannot exceed 240 minutes.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate message count
    const messageCountNum = parseInt(messageCount || "1");
    if (messageCountNum > 100) {
      toast({
        title: "Invalid message count",
        description: "Message count cannot exceed 100.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeploying(true);
    
    try {
      // Check if user has enough messages
      if (user) {
        const freeMessagesUsed = user.freeMessagesUsed || 0;
        const freeMessagesQuota = user.freeMessagesQuota || 100;
        
        if (freeMessagesUsed >= freeMessagesQuota) {
          toast({
            title: "Message limit reached",
            description: "You've used all your free messages. Please purchase more to continue.",
            variant: "destructive"
          });
          setIsDeploying(false);
          return;
        }
        
        // Increment message usage
        await incrementMessageUsed();
      }
      
      // Convert time limit to minutes
      const timeLimitInMinutes = timeLimitNum;
      
      // Create deployment data
      const deploymentData = {
        persona_id: persona.id,
        scope: 'current',
        mode,
        custom_prompt: customInstructions,
        time_limit: timeLimitInMinutes,
        message_count: messageCountNum,
        flag_keywords: [], // Empty since we're not using this for now
        flag_action: 'pause'
      };
      
      // Create deployment in database if user is logged in
      if (user) {
        await createPersonaDeployment(deploymentData);
        await incrementAgentUsed();
      }
      
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
      
      // Reset form after successful deployment
      setCustomInstructions('');
      setTimeLimit('60');
      setMessageCount('1');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
            <img 
              src={persona.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} 
              alt={persona.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{persona.name}</h2>
            <div className="flex flex-wrap gap-1 mt-1">
              {persona.tags.slice(0, 3).map((tag) => (
                <Badge variant="outline" key={tag} className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
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
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input 
                  id="time-limit" 
                  placeholder="60"
                  type="number" 
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  min="1"
                  max="240"
                  className="flex-1"
                />
                <p className="text-xs text-gray-500 mt-1">Max: 240 minutes</p>
              </div>
              <div>
                <Label htmlFor="message-count">Message Count</Label>
                <Input 
                  id="message-count" 
                  placeholder="1"
                  type="number"
                  value={messageCount}
                  onChange={(e) => setMessageCount(e.target.value)}
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">Max: 100 messages</p>
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
          ) : (
            "Save & Deploy"
          )}
        </Button>
      </div>
    </div>
  );
};

export default PersonaDetail;
