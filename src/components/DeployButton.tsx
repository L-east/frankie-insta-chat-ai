
import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';

interface DeployButtonProps {
  onClick: () => void;
  isDeployed?: boolean;
}

const DeployButton = ({ onClick, isDeployed = false }: DeployButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      className={`text-xs px-2 py-1 h-8 ${isDeployed ? 'bg-green-500 hover:bg-green-600' : 'bg-frankiePurple hover:bg-frankiePurple-dark'}`}
    >
      <MessageSquare className="mr-1 h-3 w-3" />
      {isDeployed ? 'Agent Active' : 'Deploy Frankie'}
    </Button>
  );
};

export default DeployButton;
