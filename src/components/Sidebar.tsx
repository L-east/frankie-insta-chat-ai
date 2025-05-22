import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, X, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { usePersonaStore } from "@/store/personaStore";
import PersonaCard from './PersonaCard';
import PersonaDetail from './PersonaDetail';
import SettingsRefactored from './SettingsRefactored';
import Auth from './Auth';
import { getUserAgentsUsage } from '@/services/personaService';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, profile } = useAuth();
  const { personas, selectPersona, selectedPersonaId, getSelectedPersona, deselectPersona } = usePersonaStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [agentsUsage, setAgentsUsage] = useState<any>(null);
  const { signOut } = useAuth();
  
  const isAuthenticated = !!user;

  useEffect(() => {
    if (isAuthenticated) {
      fetchAgentsUsage();
    }
  }, [isAuthenticated, profile]);

  const fetchAgentsUsage = async () => {
    try {
      if (!user) return;
      const usageData = await getUserAgentsUsage();
      setAgentsUsage(usageData);
    } catch (error) {
      console.error('Error fetching agents usage:', error);
    }
  };
    
  const selectedPersona = getSelectedPersona();
  
  const handleBackToPersonas = () => {
    deselectPersona();
    setShowSettings(false);
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col z-50`}>
      {/* Top Layer - Logo and Dismiss */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            src="/assets/icon48.png" 
            alt="Frankie AI" 
            className="h-8 w-8"
          />
          <h1 className="text-lg font-bold">Frankie AI</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      {/* User Greeting and Actions */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            {isAuthenticated ? (
              <p className="font-medium">Hello, {profile?.name || user.email.split('@')[0]}</p>
            ) : (
              <Button 
                variant="ghost" 
                onClick={() => setShowAuth(true)}
                className="text-frankiePurple"
              >
                Login
              </Button>
            )}
          </div>
          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                <Settings size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut size={18} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        {showSettings ? (
          <SettingsRefactored onBack={handleBackToPersonas} />
        ) : selectedPersonaId ? (
          selectedPersona && (
            <PersonaDetail 
              persona={selectedPersona} 
              onBack={handleBackToPersonas} 
              onOpenAuth={() => setShowAuth(true)} 
            />
          )
        ) : (
          <>
            {/* Personas grid */}
            <div className="space-y-4">
              {personas.map((persona) => (
                <PersonaCard 
                  key={persona.id}
                  persona={persona}
                  onClick={() => selectPersona(persona.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t text-center">
        <p className="text-xs text-frankieGray">© 2025 Frankie AI - v1.0.0</p>
      </div>
      
      {/* Auth modal */}
      <Auth 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
      />
    </div>
  );
};

export default Sidebar;
