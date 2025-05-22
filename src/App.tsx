
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InstagramChatIntegration from './components/InstagramChatIntegration';
import Sidebar from './components/Sidebar';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster";
import './App.css';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  useEffect(() => {
    // Listen for messages to control the sidebar
    const handleMessage = (event: MessageEvent) => {
      console.log("App received message:", event.data);
      
      if (event.data.action === 'openAgentConfig') {
        setSidebarOpen(true);
      }
      
      if (event.data.action === 'closeSidebar') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Check if we're in an iframe
    const isInIframe = window !== window.parent;
    console.log("App running in iframe:", isInIframe);
    
    // If in iframe, open sidebar automatically
    if (isInIframe) {
      setSidebarOpen(true);
    }
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  return (
    <Router>
      <div className="App">
        <InstagramChatIntegration />
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => {
            setSidebarOpen(false);
            // Notify parent window to close sidebar if we're in an iframe
            if (window !== window.parent) {
              window.parent.postMessage({ action: 'closeSidebar' }, '*');
            }
          }}
        />
        <Routes>
          <Route path="/" element={<div className="min-h-screen flex items-center justify-center">
            <p>Frankie AI is running in sidebar mode</p>
          </div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
    </Router>
  );
};

export default App;
