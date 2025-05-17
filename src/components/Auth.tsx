
import React from 'react';
import AuthContainer from './auth/AuthContainer';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
}

const Auth = ({ isOpen, onClose }: AuthProps) => {
  return <AuthContainer isOpen={isOpen} onClose={onClose} />;
};

export default Auth;
