import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import InstagramChatIntegration from './components/InstagramChatIntegration';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <InstagramChatIntegration />
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
