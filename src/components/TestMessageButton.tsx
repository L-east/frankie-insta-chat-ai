
import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { simulateMessageSent } from '@/services/messageTrackingService';
import { MessageCircle } from "lucide-react";

interface TestMessageButtonProps {
  deploymentId?: string;
  onMessageSent?: () => void;
}

const TestMessageButton: React.FC<TestMessageButtonProps> = ({ deploymentId, onMessageSent }) => {
  const handleSimulateMessage = async () => {
    if (!deploymentId) {
      toast({
        title: "No Active Deployment",
        description: "Please deploy an agent first.",
        variant: "destructive"
      });
      return;
    }

    try {
      await simulateMessageSent(deploymentId);
      toast({
        title: "Message Sent!",
        description: "Message usage has been updated.",
      });
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      console.error('Error simulating message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      onClick={handleSimulateMessage}
      disabled={!deploymentId}
      variant="outline"
      className="w-full"
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Simulate Message Sent
    </Button>
  );
};

export default TestMessageButton;
