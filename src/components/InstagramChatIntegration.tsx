
import React, { useEffect, useState } from 'react';
import AgentConfigDrawer from './AgentConfigDrawer';
import { toast } from "@/components/ui/use-toast";
import { incrementMessageUsed } from '@/services/personaService';
import { useAuthStore } from '@/store/authStore';

const InstagramChatIntegration: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentChatData, setCurrentChatData] = useState<any>(null);
  const [activeAgentChats, setActiveAgentChats] = useState<Set<string>>(new Set());
  const { user } = useAuthStore();
  
  // Listen for messages from the content script
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log("InstagramChatIntegration received message:", event.data);
      
      if (event.data.action === 'openAgentConfig' && event.data.chatData) {
        const { chatData } = event.data;
        console.log("Opening agent config with chat data:", chatData);
        
        // Store current chat data
        setCurrentChatData(chatData);
        
        // Open config drawer
        setIsDrawerOpen(true);
      }
    };

    window.addEventListener('message', handleMessage);
    console.log("InstagramChatIntegration: Message listener set up");
    
    // Send ready message to content script
    if (window.parent) {
      window.parent.postMessage({ action: 'appReady' }, '*');
      console.log("Sent appReady message to parent");
    }
    
    return () => {
      window.removeEventListener('message', handleMessage);
      console.log("InstagramChatIntegration: Message listener removed");
    };
  }, []);
  
  // Handle agent deployment after configuration
  const handleAgentDeploy = async (config: any) => {
    try {
      console.log("Deploying agent with config:", config);
      
      // Add to active chats
      setActiveAgentChats(prev => {
        const updated = new Set(prev);
        updated.add(config.chatData.chatId);
        return updated;
      });
      
      // Update message usage if user is authenticated
      if (user) {
        await incrementMessageUsed();
      }
      
      // Send message back to content script
      if (window.parent) {
        window.parent.postMessage({
          action: 'deployAgent',
          config: config
        }, '*');
        
        console.log("Sent deployAgent message to parent");
      } else {
        console.error("No parent window found");
      }
      
      toast({
        title: "Agent Deployed",
        description: `${config.persona.name} is now active in ${config.scope === 'current' ? 'the current chat' : 'all chats'}.`,
      });
      
      // Close the drawer
      setIsDrawerOpen(false);
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
        onClose={() => {
          setIsDrawerOpen(false);
          console.log("Closing agent config drawer");
        }}
        chatData={currentChatData}
        onDeploy={handleAgentDeploy}
      />
    </>
  );
};

export default InstagramChatIntegration;
