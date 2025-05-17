
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  handleForgotPassword: () => void;
  setShowForgotPassword: (showForgotPassword: boolean) => void;
  errors: {email?: string; password?: string; confirmPassword?: string; name?: string};
  isLoading: boolean;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  email,
  setEmail,
  handleForgotPassword,
  setShowForgotPassword,
  errors,
  isLoading
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="hello@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
      </div>
      
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => setShowForgotPassword(false)}>
          Back to login
        </Button>
        <Button onClick={handleForgotPassword} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
