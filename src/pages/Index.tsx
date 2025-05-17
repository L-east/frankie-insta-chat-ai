
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Sidebar from '@/components/Sidebar';
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
    toast({
      title: "Frankie AI",
      description: "Welcome to the Frankie AI demo! Explore AI personas for Instagram chat.",
    });
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
          <Button 
            onClick={handleOpenSidebar}
            className="bg-frankiePurple hover:bg-frankiePurple-dark text-white px-8 py-6 rounded-lg text-lg"
          >
            Open Frankie AI
          </Button>
          <p className="mt-4 text-frankieGray-light text-sm">
            This is a demo of the Frankie AI Chrome extension. 
            In the actual extension, click the toolbar icon to open the sidebar.
          </p>
        </div>
        
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
    </div>
  );
};

export default Index;
