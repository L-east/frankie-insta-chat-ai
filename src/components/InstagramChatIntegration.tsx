
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
  
  // This function would be called by our browser extension's content script
  // when it detects Instagram's chat interface is loaded
  const injectDeployButtons = () => {
    console.log('Injecting deploy buttons into Instagram chat');
    
    // In a real extension, we would find all chat text areas and inject our button next to them
    // Simulated implementation:
    // 1. Find all chat input areas
    const chatInputs = document.querySelectorAll('.instagram-chat-input');
    
    // 2. Attach deploy buttons
    chatInputs.forEach(input => {
      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'frankie-deploy-button-container';
      
      // Render our React button into this container
      // In a real extension, we would use ReactDOM.createRoot().render()
      
      // Insert next to input
      input.parentElement?.insertBefore(buttonContainer, input.nextSibling);
    });
  };
  
  // Handle clicking the deploy button
  const handleDeployClick = (chatElement: HTMLElement, chatId: string) => {
    // Extract chat messages
    const messages = extractChatMessages(chatElement);
    
    // Store current chat data
    setCurrentChatData({
      chatId,
      messages
    });
    
    // Open config drawer
    setIsDrawerOpen(true);
  };
  
  // Handle agent deployment after configuration
  const handleAgentDeploy = (config: any) => {
    try {
      // Deploy the agent
      const agent = deployAgent(config);
      
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
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Effect to initialize the integration when the component mounts
  useEffect(() => {
    console.log('Instagram Chat Integration initialized');
    
    // In a real extension, we would:
    // 1. Set up a MutationObserver to watch for new chat interfaces
    // 2. Call injectDeployButtons whenever new chat interfaces are detected
    
    // Simulated initialization
    setTimeout(injectDeployButtons, 1000);
    
    // Cleanup function
    return () => {
      // Remove any event listeners or observers
    };
  }, []);
  
  // This component doesn't render anything directly in the page
  // It works by injecting elements into the Instagram interface
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
