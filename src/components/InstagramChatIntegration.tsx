
import React, { useEffect, useState } from 'react';
import AgentConfigDrawer from './AgentConfigDrawer';
import { toast } from "@/components/ui/use-toast";
import { incrementMessageUsed } from '@/services/personaService';
import { useAuthStore } from '@/store/authStore';

const InstagramChatIntegration: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentChatData, setCurrentChatData] = useState<any>(null);
  const [activeAgentChats, setActiveAgentChats] = useState<Set<string>>(new Set());
  const [isExtensionContext, setIsExtensionContext] = useState(false);
  const { user } = useAuthStore();
  
  // Listen for messages from the content script
  useEffect(() => {
    // Check if we're running in an extension context
    const isInExtension = window !== window.parent || 
                         window.location.protocol === 'chrome-extension:' ||
                         window.location.href.includes('chrome-extension://');
    
    setIsExtensionContext(isInExtension);
    console.log('InstagramChatIntegration: Extension context detected:', isInExtension);
    
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
    
    // Send ready message to content script if in extension context
    if (isInExtension && window.parent && window.parent !== window) {
      // Small delay to ensure content script is ready
      setTimeout(() => {
        window.parent.postMessage({ action: 'appReady' }, '*');
        console.log("Sent appReady message to parent");
      }, 1000);
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
      
      // Validate time and message limits
      const timeLimit = config.time_limit || 60;
      const messageCount = config.message_count || 1;
      
      if (timeLimit > 240) {
        toast({
          title: "Invalid time limit",
          description: "Time limit cannot exceed 240 minutes.",
          variant: "destructive"
        });
        return;
      }
      
      if (messageCount > 100) {
        toast({
          title: "Invalid message count", 
          description: "Message count cannot exceed 100.",
          variant: "destructive"
        });
        return;
      }
      
      // Add to active chats
      setActiveAgentChats(prev => {
        const updated = new Set(prev);
        updated.add(config.chatData.chatId);
        return updated;
      });
      
      // Update message usage if user is authenticated
      if (user) {
        try {
          await incrementMessageUsed();
        } catch (error) {
          console.warn('Failed to increment message usage:', error);
        }
      }
      
      // Send enhanced config with limits to content script
      const enhancedConfig = {
        ...config,
        time_limit: timeLimit,
        message_count: messageCount,
        start_time: Date.now()
      };
      
      // Send message back to content script
      if (isExtensionContext && window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({
            action: 'deployAgent',
            config: enhancedConfig
          }, '*');
          
          console.log("Sent deployAgent message to parent with enhanced config");
        } catch (error) {
          console.error("Error sending message to parent:", error);
        }
      } else {
        console.log("Not in extension context or no parent window found");
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
  
  // Only show status when not in drawer mode
  if (isExtensionContext && !isDrawerOpen) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-white">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <img 
              src="/assets/icon48.png" 
              alt="Frankie AI" 
              className="h-16 w-16 mx-auto mb-4"
            />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Frankie AI Ready</h2>
          <p className="text-gray-600 mb-4">Click the "Deploy Frankie" button on Instagram to configure your AI agent.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">Extension is loaded and waiting for Instagram chat interaction.</p>
          </div>
        </div>
      </div>
    );
  }
  
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
