
import React, { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { updateMessageUsage } from '@/services/messageTrackingService';
import { useAuthStore } from '@/store/authStore';
import Sidebar from './Sidebar';

const ChatIntegration: React.FC = () => {
  const [currentChatData, setCurrentChatData] = useState<any>(null);
  const [isExtensionContext, setIsExtensionContext] = useState(false);
  const [currentDeploymentId, setCurrentDeploymentId] = useState<string | null>(null);
  const { user } = useAuthStore();
  
  useEffect(() => {
    const isInExtension = window !== window.parent || 
                         window.location.protocol === 'chrome-extension:' ||
                         window.location.href.includes('chrome-extension://');
    
    setIsExtensionContext(isInExtension);
    console.log('ChatIntegration: Extension context detected:', isInExtension);
    
    const handleMessage = async (event: MessageEvent) => {
      console.log("ChatIntegration received message:", event.data);
      
      if (event.data.action === 'openAgentConfig' && event.data.chatData) {
        const { chatData } = event.data;
        console.log("Opening agent config with chat data:", chatData);
        setCurrentChatData(chatData);
      }

      if (event.data.action === 'openFrankie') {
        window.location.href = 'https://www.instagram.com/direct/inbox/';
      }

      // Handle message sent event from content script
      if (event.data.action === 'messageSent' && currentDeploymentId) {
        console.log('Message sent detected, updating usage');
        try {
          await updateMessageUsage(currentDeploymentId, 1);
          console.log('Message usage updated successfully');
        } catch (error) {
          console.error('Failed to update message usage:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    console.log("ChatIntegration: Message listener set up");
    
    if (isInExtension && window.parent && window.parent !== window) {
      setTimeout(() => {
        window.parent.postMessage({ action: 'appReady' }, '*');
        console.log("Sent appReady message to parent");
      }, 1000);
    }
    
    return () => {
      window.removeEventListener('message', handleMessage);
      console.log("ChatIntegration: Message listener removed");
    };
  }, [currentDeploymentId]);
  
  const handleAgentDeploy = async (config: any) => {
    try {
      console.log("Deploying agent with config:", config);
      
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
      
      const enhancedConfig = {
        ...config,
        time_limit: timeLimit,
        message_count: messageCount,
        start_time: Date.now()
      };

      // Store deployment ID for message tracking
      if (config.deploymentId) {
        setCurrentDeploymentId(config.deploymentId);
        console.log('Set current deployment ID:', config.deploymentId);
      }
      
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
      }
      
      toast({
        title: "Agent Deployed",
        description: `${config.persona.name} is now active in the chat.`,
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
  
  if (isExtensionContext) {
    return (
      <Sidebar 
        isOpen={true} 
        onClose={() => {
          console.log('Closing Frankie from ChatIntegration');
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ action: 'closeFrankie' }, '*');
          }
        }} 
        chatData={currentChatData}
        onDeploy={handleAgentDeploy}
      />
    );
  }
  
  return null;
};

export default ChatIntegration;
