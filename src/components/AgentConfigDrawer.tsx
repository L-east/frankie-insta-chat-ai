
import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePersonaStore } from "@/store/personaStore";
import { toast } from "@/components/ui/use-toast";
import { createPersonaDeployment, PersonaDeploymentData, incrementAgentUsed } from "@/services/personaService";
import { useAuth } from "@/contexts/AuthContext";
import PersonaCard from './PersonaCard';
import { Loader } from "lucide-react";

interface AgentConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chatData: {
    chatId: string;
    messages: any[];
  };
  onDeploy: (config: any) => void;
}

const AgentConfigDrawer: React.FC<AgentConfigDrawerProps> = ({ 
  isOpen, 
  onClose, 
  chatData,
  onDeploy
}) => {
  const { personas, selectPersona, selectedPersonaId, getSelectedPersona } = usePersonaStore();
  const { user, profile } = useAuth();
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Form state
  const [scope, setScope] = useState<'current'|'all'>('current');
  const [customPrompt, setCustomPrompt] = useState('');
  const [toneStrength, setToneStrength] = useState([5]);
  const [flagKeywords, setFlagKeywords] = useState('');
  const [flagAction, setFlagAction] = useState('pause');
  const [timeLimit, setTimeLimit] = useState('');
  const [messageCount, setMessageCount] = useState('');
  const [mode, setMode] = useState<'auto'|'manual'>('auto');

  const selectedPersona = getSelectedPersona();

  const handleDeploy = async () => {
    if (!selectedPersona) {
      toast({
        title: "Select a persona",
        description: "Please select a persona before deploying the agent.",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    
    try {
      // Prepare deployment data
      const deploymentData: PersonaDeploymentData = {
        persona_id: selectedPersona.id,
        scope: scope,
        mode: mode,
        custom_prompt: customPrompt || undefined,
        tone_strength: toneStrength[0],
        flag_keywords: flagKeywords ? flagKeywords.split(',').map(k => k.trim()) : undefined,
        flag_action: flagAction,
        time_limit: timeLimit ? parseInt(timeLimit) : undefined,
        message_count: messageCount ? parseInt(messageCount) : undefined,
        auto_stop: true
      };
      
      // Create deployment in database
      await createPersonaDeployment(deploymentData);
      
      // Increment agent usage counter
      await incrementAgentUsed();
      
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

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Deploy AI Agent</DrawerTitle>
        </DrawerHeader>
        
        <div className="px-4 overflow-y-auto pb-2 max-h-[calc(90vh-10rem)]">
          {/* Persona selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Select Persona</h3>
            <div className="grid grid-cols-2 gap-3">
              {personas.map((persona) => (
                <PersonaCard 
                  key={persona.id}
                  persona={persona}
                  onClick={() => selectPersona(persona.id)}
                  isSelected={selectedPersonaId === persona.id}
                />
              ))}
            </div>
          </div>

          {/* Configuration sections */}
          <div className="space-y-6">
            {/* Scope of Task */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Scope of Task</h4>
              <RadioGroup value={scope} onValueChange={(value) => setScope(value as 'current'|'all')}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="current" id="current" />
                  <Label htmlFor="current">Current Chat Only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">All Chats on Page</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Behavior Rules */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Behavior Rules</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-prompt">Custom Instructions</Label>
                  <Textarea 
                    id="custom-prompt" 
                    placeholder="Add custom instructions to guide the AI..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="tone-strength">Tone Strength</Label>
                    <span className="text-sm">{toneStrength[0]}/10</span>
                  </div>
                  <Slider 
                    id="tone-strength" 
                    value={toneStrength} 
                    min={1} 
                    max={10} 
                    step={1}
                    onValueChange={setToneStrength} 
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtle</span>
                    <span>Strong</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Label htmlFor="flag-keywords">Flag Keywords</Label>
                    <Input 
                      id="flag-keywords" 
                      placeholder="comma, separated, words"
                      value={flagKeywords}
                      onChange={(e) => setFlagKeywords(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="flag-action">On Flag</Label>
                    <Select value={flagAction} onValueChange={setFlagAction}>
                      <SelectTrigger id="flag-action">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pause">Pause</SelectItem>
                        <SelectItem value="notify">Notify</SelectItem>
                        <SelectItem value="continue">Continue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Session Controls */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Session Controls</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                    <Input 
                      id="time-limit" 
                      placeholder="e.g. 30"
                      type="number" 
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message-count">Message Count</Label>
                    <Input 
                      id="message-count" 
                      placeholder="e.g. 10"
                      type="number"
                      value={messageCount}
                      onChange={(e) => setMessageCount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="mb-2">Mode</div>
                  <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'auto'|'manual')}>
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="auto" id="auto" />
                      <Label htmlFor="auto">Fully Auto (agent sends directly)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual">Semi-Manual (agent drafts, you send)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {profile && !profile.is_pro && (
                  <div className="text-xs text-gray-500 mt-4">
                    You've deployed {profile.free_agents_used}/{profile.free_agents_total} free agents.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DrawerFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button 
            onClick={handleDeploy} 
            disabled={isDeploying || !selectedPersonaId}
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
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AgentConfigDrawer;
