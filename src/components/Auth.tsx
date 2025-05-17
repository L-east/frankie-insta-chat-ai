
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
}

const Auth = ({ isOpen, onClose }: AuthProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string; confirmPassword?: string; name?: string}>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { signIn, signUp, resetPassword, isLoading } = useAuth();

  const validate = () => {
    const newErrors: {email?: string; password?: string; confirmPassword?: string; name?: string} = {};
    
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (isSignup) {
      if (!name) newErrors.name = 'Name is required';
      
      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      if (isSignup) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (error) {
      // Errors are handled in the auth context
      console.error("Authentication error:", error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ ...errors, email: 'Please enter your email' });
      return;
    }
    
    try {
      await resetPassword(email);
      setShowForgotPassword(false);
    } catch (error) {
      // Errors are handled in the auth context
      console.error("Reset password error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {showForgotPassword 
              ? "Reset your password" 
              : isSignup 
                ? "Create an account" 
                : "Welcome back"}
          </DialogTitle>
        </DialogHeader>
        
        {showForgotPassword ? (
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
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>
            )}
            
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
            
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
              </div>
            )}
            
            <Button type="submit" className="w-full bg-frankiePurple hover:bg-frankiePurple-dark" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {isSignup ? "Creating account..." : "Logging in..."}
                </>
              ) : (
                isSignup ? "Sign up" : "Log in"
              )}
            </Button>
            
            <div className="flex items-center justify-between">
              <Button 
                variant="link" 
                type="button" 
                onClick={() => setIsSignup(!isSignup)}
                className="p-0"
              >
                {isSignup ? "Already have an account? Log in" : "Need an account? Sign up"}
              </Button>
              
              {!isSignup && (
                <Button 
                  variant="link" 
                  type="button" 
                  onClick={() => setShowForgotPassword(true)}
                  className="p-0"
                >
                  Forgot password?
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
