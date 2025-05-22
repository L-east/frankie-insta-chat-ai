import React, { useEffect, useState } from 'react';
import DeployButton from './DeployButton';
import AgentConfigDrawer from './AgentConfigDrawer';
import { extractChatMessages, getAllOpenChats } from '@/services/chatService';
import { deployAgent, getActiveAgents } from '@/services/agentService';
import { toast } from "@/components/ui/use-toast";

const InstagramChatIntegration: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentChatData, setCurrentChatData] = useState<any>(null);
  const [activeAgentChats, setActiveAgentChats] = useState<Set<string>>(new Set());
  
  // Listen for messages from the content script
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === 'deployAgent') {
        const { config } = event.data;
        handleAgentDeploy(config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle clicking the deploy button
  const handleDeployClick = (chatElement: HTMLElement, chatId: string) => {
    try {
      // Extract chat messages
      const messages = extractChatMessages(chatElement);
      
      // Store current chat data
      setCurrentChatData({
        chatId,
        messages
      });
      
      // Open config drawer
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Error handling deploy click:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle agent deployment after configuration
  const handleAgentDeploy = async (config: any) => {
    try {
      // Deploy the agent
      const agent = await deployAgent(config);
      
      // Add to active chats
      setActiveAgentChats(prev => {
        const updated = new Set(prev);
        updated.add(config.chatData.chatId);
        return updated;
      });
      
      toast({
        title: "Agent Deployed",
        description: `${config.persona.name} is now active in ${config.scope === 'current' ? 'the current chat' : 'all chats'}.`,
      });
    } catch (error) {
      console.error('Failed to deploy agent:', error);
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <AgentConfigDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        chatData={currentChatData}
        onDeploy={handleAgentDeploy}
      />
    </>
  );
};

export default InstagramChatIntegration;
