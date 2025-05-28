
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatIntegration from './components/ChatIntegration';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import './App.css';

const App = () => {
  useEffect(() => {
    const isInIframe = window !== window.parent;
    console.log("App running in iframe:", isInIframe);
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ChatIntegration />
          <Routes>
            <Route path="/" element={<div className="min-h-screen flex items-center justify-center">
              <p>Frankie AI is running in sidebar mode</p>
            </div>} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
