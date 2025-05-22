
import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePersonaStore } from "@/store/personaStore";
import { toast } from "@/components/ui/use-toast";
import { createPersonaDeployment, PersonaDeploymentData, incrementAgentUsed, getUserAgentsUsage, incrementMessageUsed } from '@/services/personaService';
import { useAuth } from '@/contexts/AuthContext';
import PersonaCard from './PersonaCard';
import { Loader } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("deploy");
  
  // Form state
  const [customPrompt, setCustomPrompt] = useState('');
  const [toneStrength, setToneStrength] = useState(5);
  const [timeLimit, setTimeLimit] = useState('60');
  const [messageCount, setMessageCount] = useState('1');
  const [mode, setMode] = useState<'auto'|'manual'>('auto');
  const [deploymentHistory, setDeploymentHistory] = useState<any[]>([]);

  const selectedPersona = getSelectedPersona();
  
  useEffect(() => {
    if (isOpen) {
      fetchAgentUsage();
      if (user) fetchDeploymentHistory();
      
      // Reset form fields when drawer opens
      deselectPersona();
      setTimeLimit('60');
      setMessageCount('1');
      setCustomPrompt('');
      setActiveTab('deploy');
    }
  }, [isOpen, user]);
  
  const fetchAgentUsage = async () => {
    try {
      if (user) {
        const usageData = await getUserAgentsUsage();
        setAgentUsage(usageData);
      }
    } catch (error) {
      console.error('Error fetching agents usage:', error);
    }
  };
  
  const fetchDeploymentHistory = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('persona_deployments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDeploymentHistory(data || []);
    } catch (error) {
      console.error('Error fetching deployment history:', error);
    }
  };

  const handleDeploy = async () => {
    if (!selectedPersona) {
      toast({
        title: "Select a persona",
        description: "Please select a persona before deploying the agent.",
        variant: "destructive"
      });
      return;
    }
    
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
      if (user && agentUsage) {
        const freeMessagesUsed = agentUsage.free_messages_used || 0;
        const freeMessagesQuota = agentUsage.free_messages_quota || 100;
        
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
      
      // Prepare deployment data
      const deploymentData: PersonaDeploymentData = {
        persona_id: selectedPersona.id,
        scope: 'current',
        mode: mode,
        custom_prompt: customPrompt || undefined,
        tone_strength: toneStrength,
        flag_keywords: [],
        flag_action: 'pause',
        time_limit: timeLimitNum,
        message_count: messageCountNum,
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

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return <span className="text-green-500">Active</span>;
      case 'finished': return <span className="text-gray-500">Finished</span>;
      case 'paused': return <span className="text-yellow-500">Paused</span>;
      default: return <span className="text-gray-500">{status}</span>;
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Frankie AI</DrawerTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deploy">Deploy Agent</TabsTrigger>
              <TabsTrigger value="history">Agent History</TabsTrigger>
            </TabsList>
          
            <div className="px-4 overflow-y-auto pb-2 max-h-[calc(90vh-10rem)]">
              <TabsContent value="deploy">
                {/* Persona selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Select Persona</h3>
                  <div className="space-y-3">
                    {personas.map((persona) => (
                      <PersonaCard 
                        key={persona.id}
                        persona={persona}
                        onClick={() => selectPersona(persona.id)}
                        isSelected={selectedPersonaId === persona.id}
                        layout="horizontal"
                      />
                    ))}
                  </div>
                </div>

                {/* Configuration sections */}
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Instructions for {selectedPersona?.name || 'persona'}</h4>
                    <div className="space-y-2">
                      <Textarea 
                        placeholder="Add custom instructions to guide the AI..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                      />
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
                            placeholder="60"
                            type="number" 
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(e.target.value)}
                            min="1"
                            max="240"
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
                      
                      {agentUsage && user && (
                        <div className="text-xs text-gray-500 mt-4">
                          <div>
                            Messages: {agentUsage.free_messages_used}/{agentUsage.free_messages_quota} used
                          </div>
                          {agentUsage.free_messages_expiry && (
                            <div>
                              Expires in {Math.max(0, Math.ceil((new Date(agentUsage.free_messages_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Agent History</h3>
                  
                  {deploymentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {deploymentHistory.map((deployment) => (
                        <div key={deployment.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{
                                personas.find(p => p.id === deployment.persona_id)?.name || 
                                "Agent"
                              }</h4>
                              <div className="text-sm text-gray-500">
                                Deployed {new Date(deployment.created_at).toLocaleDateString()}
                              </div>
                              <div className="mt-1">
                                Status: {getStatusLabel(deployment.status || 'unknown')}
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div>Messages: {deployment.messages_sent || 0}/{deployment.message_count || 'N/A'}</div>
                              <div>Mode: {deployment.mode}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No deployment history yet
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DrawerHeader>
        
        <DrawerFooter>
          {activeTab === 'deploy' && (
            <>
              <Button onClick={onClose} variant="outline">Cancel</Button>
              <Button 
                onClick={handleDeploy}
                className="bg-frankiePurple hover:bg-frankiePurple-dark"
                disabled={isDeploying || !selectedPersonaId}
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
            </>
          )}
          {activeTab === 'history' && (
            <Button onClick={() => setActiveTab('deploy')} variant="outline">
              Back to Deploy
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AgentConfigDrawer;
