
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { Provider } from '@supabase/supabase-js';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import SocialAuthButtons from './SocialAuthButtons';
import AuthDivider from './AuthDivider';

interface AuthContainerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({ isOpen, onClose }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string; confirmPassword?: string; name?: string}>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { signIn, signUp, resetPassword, signInWithSocialProvider, isLoading } = useAuth();

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

  const handleSocialSignIn = async (provider: Provider) => {
    try {
      await signInWithSocialProvider(provider);
    } catch (error) {
      // Errors are handled in the auth context
      console.error(`${provider} authentication error:`, error);
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
          <ForgotPasswordForm
            email={email}
            setEmail={setEmail}
            handleForgotPassword={handleForgotPassword}
            setShowForgotPassword={setShowForgotPassword}
            errors={errors}
            isLoading={isLoading}
          />
        ) : (
          <>
            {isSignup ? (
              <SignupForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                name={name}
                setName={setName}
                handleSubmit={handleSubmit}
                setIsSignup={setIsSignup}
                errors={errors}
                isLoading={isLoading}
              />
            ) : (
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleSubmit={handleSubmit}
                setIsSignup={setIsSignup}
                setShowForgotPassword={setShowForgotPassword}
                errors={errors}
                isLoading={isLoading}
              />
            )}
            
            <AuthDivider />
            
            <SocialAuthButtons 
              handleSocialSignIn={handleSocialSignIn} 
              isLoading={isLoading} 
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthContainer;
