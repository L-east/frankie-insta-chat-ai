
import React from 'react';

const AuthDivider: React.FC = () => {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t"></span>
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">or continue with</span>
      </div>
    </div>
  );
};

export default AuthDivider;
