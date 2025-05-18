
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Sidebar from '@/components/Sidebar';
import { toast } from "@/components/ui/use-toast";
import InstagramChatIntegration from '@/components/InstagramChatIntegration';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showInstagramInterface, setShowInstagramInterface] = useState(false);

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
    toast({
      title: "Frankie AI",
      description: "Welcome to the Frankie AI demo! Explore AI personas for Instagram chat.",
    });
  };
  
  const handleToggleInstagramInterface = () => {
    setShowInstagramInterface(!showInstagramInterface);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-frankiePurple-light to-white">
      <div className="max-w-xl w-full px-4">
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <img 
              src="/placeholder.svg" 
              alt="Frankie AI" 
              className="h-20 w-20 p-2 bg-white rounded-full shadow-md"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-frankiePurple-dark">Frankie AI</h1>
          <p className="text-xl text-frankieGray mb-8">
            Deploy AI personas in your Instagram chats with one click.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleOpenSidebar}
              className="bg-frankiePurple hover:bg-frankiePurple-dark text-white px-8 py-6 rounded-lg text-lg"
            >
              Open Frankie AI
            </Button>
            <Button 
              onClick={handleToggleInstagramInterface}
              variant="outline"
              className="px-8 py-6 rounded-lg text-lg"
            >
              {showInstagramInterface ? "Hide" : "Show"} Instagram Demo
            </Button>
          </div>
          <p className="mt-4 text-frankieGray-light text-sm">
            This is a demo of the Frankie AI Chrome extension. 
            In the actual extension, click the toolbar icon to open the sidebar.
          </p>
        </div>
        
        {showInstagramInterface && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Instagram Chat Demo</h2>
            <div className="border rounded-lg p-4 min-h-64 bg-gray-50">
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <span>user123</span>
                </div>
              </div>
              
              <div className="py-4 min-h-40">
                <div className="text-gray-400 text-center text-sm">
                  This is where chat messages would appear
                </div>
              </div>
              
              <div className="flex items-center gap-2 border-t pt-3">
                <input 
                  type="text" 
                  className="flex-1 border rounded-full px-4 py-2 text-sm" 
                  placeholder="Message..." 
                />
                <Button 
                  className="bg-frankiePurple hover:bg-frankiePurple-dark text-white text-xs px-3 py-1 h-8"
                  onClick={() => {
                    setIsSidebarOpen(true);
                    toast({
                      title: "Deploy Frankie",
                      description: "Choose a persona to deploy in this chat",
                    });
                  }}
                >
                  Deploy Frankie
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Note: This is a simplified demo. In the actual extension, Frankie AI will integrate directly with Instagram's chat interface.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-frankiePurple">AI Personas</h2>
            <p className="text-frankieGray">
              Choose from a variety of personas like Casanova, Sherlock, or Comedian to 
              enhance your Instagram conversations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-frankiePurple">Smart Deployment</h2>
            <p className="text-frankieGray">
              Configure chat scope, behavior rules, and session controls for a 
              seamless AI conversation experience.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-frankiePurple">Free Tier</h2>
            <p className="text-frankieGray">
              Start with 7 free agent deployments valid for 7 days, with access to 
              4 unique personas.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 text-frankiePurple">Premium Features</h2>
            <p className="text-frankieGray">
              Upgrade to Pro for unlimited deployments, premium personas, and 
              advanced features like watermark removal.
            </p>
          </div>
        </div>
      </div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {/* This component doesn't render UI directly but injects elements into Instagram */}
      <InstagramChatIntegration />
    </div>
  );
};

export default Index;
