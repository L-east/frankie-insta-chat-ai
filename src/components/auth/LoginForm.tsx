
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Mail } from "lucide-react";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setIsSignup: (isSignup: boolean) => void;
  setShowForgotPassword: (showForgotPassword: boolean) => void;
  errors: {email?: string; password?: string; confirmPassword?: string; name?: string};
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  handleSubmit,
  setIsSignup,
  setShowForgotPassword,
  errors,
  isLoading
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
      </div>
      
      <Button type="submit" className="w-full bg-frankiePurple hover:bg-frankiePurple-dark" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <Mail className="mr-2" />
            Log in with Email
          </>
        )}
      </Button>
      
      <div className="flex items-center justify-between">
        <Button 
          variant="link" 
          type="button" 
          onClick={() => setIsSignup(true)}
          className="p-0"
        >
          Need an account? Sign up
        </Button>
        
        <Button 
          variant="link" 
          type="button" 
          onClick={() => setShowForgotPassword(true)}
          className="p-0"
        >
          Forgot password?
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
