
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { User, Settings, X } from "lucide-react";
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
      {/* Header with settings and logout */}
      <div className="p-3 border-b flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowAuth(true)}>
                <User size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowSettings(true)}>
                <Settings size={18} />
              </Button>
            </>
          ) : (
            <Button 
              size="sm" 
              className="bg-frankiePurple hover:bg-frankiePurple-dark"
              onClick={() => setShowAuth(true)}
            >
              Log in
            </Button>
          )}
        </div>
        
        <div className="flex items-center">
          {!selectedPersonaId && !showSettings ? (
            <div className="flex items-center">
              <img 
                src="/placeholder.svg" 
                alt="Frankie AI" 
                className="h-8 w-8 mr-2"
              />
              <h1 className="text-lg font-bold">Frankie AI</h1>
            </div>
          ) : null}
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-2">
            <X size={18} />
          </Button>
        </div>
      </div>
      
      {/* User info / Login button */}
      {isAuthenticated && profile && !showAuth && !showSettings && (
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                <img 
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || user.email}`} 
                  alt={profile?.name || "User"} 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">Hello, {profile?.name || user.email.split('@')[0]}</p>
                {!profile?.is_pro && agentsUsage && (
                  <p className="text-xs text-frankieGray">
                    {agentsUsage.free_agents_used}/{agentsUsage.free_agents_total} agents used
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Free tier banner */}
      {isAuthenticated && profile && !profile.is_pro && (
        <div className="bg-gray-100 p-2 text-center text-xs text-frankieGray">
          Free tier: up to 7 personas, for 7 days from signup. Upgrade anytime.
        </div>
      )}

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
            <div className="grid grid-cols-2 gap-4">
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
        {!showSettings && !selectedPersonaId && isAuthenticated && profile && !profile.is_pro && (
          <Button variant="outline" className="w-full" onClick={() => {
            // This would redirect to upgrade page
          }}>
            Upgrade to Pro
          </Button>
        )}
        <p className="text-xs text-frankieGray mt-2">© 2025 Frankie AI - v1.0.0</p>
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
