import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePersonaStore } from "@/store/personaStore";
import { toast } from "@/components/ui/use-toast";
import { createPersonaDeployment, PersonaDeploymentData, incrementAgentUsed, getUserAgentsUsage, incrementMessageUsed, PRICING_CONFIG } from '@/services/personaService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AgentConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chatData: any;
  onDeploy: (config: any) => void;
}

const AgentConfigDrawer: React.FC<AgentConfigDrawerProps> = ({ 
  isOpen, 
  onClose, 
  chatData,
  onDeploy
}) => {
  const { personas, selectPersona, selectedPersonaId, getSelectedPersona, deselectPersona } = usePersonaStore();
  const { user, profile } = useAuth();
  const [isDeploying, setIsDeploying] = useState(false);
  const [agentUsage, setAgentUsage] = useState<any>(null);
  
  // Form state with defaults
  const [customPrompt, setCustomPrompt] = useState('');
  const [toneStrength, setToneStrength] = useState(5);
  const [timeLimit, setTimeLimit] = useState('60');
  const [messageCount, setMessageCount] = useState('1');
  const [mode, setMode] = useState<'auto'|'manual'>('auto');

  const selectedPersona = getSelectedPersona();
  
  useEffect(() => {
    console.log('AgentConfigDrawer mounted');
    if (isOpen) {
      console.log('Fetching agent usage');
      fetchAgentUsage();
      
      // Reset form fields when drawer opens
      deselectPersona();
      setTimeLimit('60');
      setMessageCount('1');
      setCustomPrompt('');
    }
  }, [isOpen, user]);
  
  const fetchAgentUsage = async () => {
    try {
      if (user) {
        const usageData = await getUserAgentsUsage();
        console.log('Agent usage data:', usageData);
        setAgentUsage(usageData);
      }
    } catch (error) {
      console.error('Error fetching agents usage:', error);
    }
  };

  const handlePersonaSelect = (personaId: string) => {
    const persona = personas.find(p => p.id === personaId);
    if (persona) {
      selectPersona(persona.id);
      // Auto-fill the first 3 attributes in the instructions
      if (persona.attributes && persona.attributes.length > 0) {
        const attributes = persona.attributes.slice(0, 3);
        setCustomPrompt(attributes.join('\n'));
      }
    }
  };

  const handleDeploy = async () => {
    console.log('Deploy button clicked');
    if (!selectedPersona) {
      toast({
        title: "Error",
        description: "Please select a persona",
        variant: "destructive"
      });
      return;
    }

    // Check if user has enough messages
    const remainingMessages = (agentUsage?.remaining_messages || 0) + PRICING_CONFIG.FREE_MESSAGES;
    if (parseInt(messageCount) > remainingMessages) {
      toast({
        title: "Insufficient Messages",
        description: (
          <div className="flex flex-col gap-2">
            <p>You don't have enough messages for this deployment.</p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={() => window.location.href = '/settings?tab=billing'}
            >
              Buy more messages
            </Button>
          </div>
        ),
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    
    try {
      // Prepare deployment data
      const deploymentData: PersonaDeploymentData = {
        persona_id: selectedPersona.id,
        scope: 'current',
        mode: mode,
        custom_prompt: customPrompt || undefined,
        tone_strength: toneStrength,
        flag_keywords: [],
        flag_action: 'pause',
        time_limit: parseInt(timeLimit),
        message_count: parseInt(messageCount),
        auto_stop: true
      };
      
      // Create deployment in database
      if (user) {
        await createPersonaDeployment(deploymentData);
        await incrementAgentUsed();
      }
      
      // Send config to parent for handling the actual deployment
      onDeploy({
        ...deploymentData,
        persona: selectedPersona,
        chatData: chatData
      });
      
      toast({
        title: `${selectedPersona.name} deployed!`,
        description: "Your AI agent is now active in the chat.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error deploying agent:', error);
      toast({
        title: "Deployment failed",
        description: "There was an error deploying your agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  if (!personas || personas.length === 0) {
    return <div className="p-4">Loading personas...</div>;
  }

  console.log('Rendering AgentConfigDrawer');

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <div>
          <h2 className="text-xl font-bold">Deploy AI Agent</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure and deploy an AI persona to handle your Instagram chat conversations.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ action: 'closeFrankie' }, '*');
            }
            onClose();
          }}
          className="h-10 w-10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {/* Persona selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Select Persona</h3>
          <div className="space-y-3">
            <Select
              value={selectedPersonaId || ''}
              onValueChange={handlePersonaSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a persona" />
              </SelectTrigger>
              <SelectContent>
                {personas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id}>
                    {persona.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Configuration sections */}
        <div className="space-y-6">
          {/* Instructions */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Instructions for {selectedPersona?.name || 'persona'}</h3>
            <div className="space-y-2">
              <Textarea 
                placeholder="Add custom instructions to guide the AI..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          {/* Time limit */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Time Limit (minutes)</h3>
            <div className="space-y-2">
              <Input 
                type="number" 
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                min="1"
                max="240"
              />
              <p className="text-xs text-gray-500">Maximum 240 minutes</p>
            </div>
          </div>

          {/* Message count */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Message Count</h3>
            <div className="space-y-2">
              <Input 
                type="number" 
                value={messageCount}
                onChange={(e) => setMessageCount(e.target.value)}
                min="1"
                max="100"
              />
              <p className="text-xs text-gray-500">
                Available messages: {agentUsage?.remaining_messages || 0}
              </p>
            </div>
          </div>

          {/* Mode selection */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Mode</h3>
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'auto'|'manual')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto">Automatic</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">Manual</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground mt-2">
              {mode === 'auto' ? 'Frankie will generate reply and send it' : 'Frankie will share reply for you to send it'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 left-0 right-0 p-4 border-t bg-white shadow-lg">
        <div className="flex justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({ action: 'closeFrankie' }, '*');
              }
              onClose();
            }}
            className="flex-1 h-10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeploy}
            disabled={isDeploying || !selectedPersona}
            className="flex-1 h-10 bg-frankiePurple hover:bg-frankiePurple-dark text-white"
          >
            {isDeploying ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              'Save & Deploy'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentConfigDrawer;
