
import React from 'react';
import { Button } from "@/components/ui/button";

interface SocialAuthButtonsProps {
  onEmailAuth: () => void;
}

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ onEmailAuth }) => {
  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={onEmailAuth}
      >
        Continue with Email
      </Button>
    </div>
  );
};

export default SocialAuthButtons;
