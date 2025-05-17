
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Settings, X } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { usePersonaStore } from "@/store/personaStore";
import PersonaCard from './PersonaCard';
import PersonaDetail from './PersonaDetail';
import SettingsComponent from './Settings';
import Auth from './Auth';
import { getUserAgentsUsage } from '@/services/personaService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, profile, signOut } = useAuth();
  const { personas, selectPersona, selectedPersonaId, getSelectedPersona, deselectPersona } = usePersonaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [agentsUsage, setAgentsUsage] = useState<any>(null);
  
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
  
  const filteredPersonas = searchTerm 
    ? personas.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : personas;
    
  const selectedPersona = getSelectedPersona();
  
  const handleBackToPersonas = () => {
    deselectPersona();
    setShowSettings(false);
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col z-50`}>
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        {!selectedPersonaId && !showSettings ? (
          <>
            <div className="flex items-center">
              <img 
                src="/placeholder.svg" 
                alt="Frankie AI" 
                className="h-8 w-8 mr-2"
              />
              <h1 className="text-lg font-bold">Frankie AI</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </>
        ) : (
          <div className="w-full">
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4">
              <X size={18} />
            </Button>
          </div>
        )}
      </div>
      
      {/* User info / Login button */}
      <div className="p-4 border-b">
        {isAuthenticated && profile ? (
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
            <Button variant="ghost" size="sm" onClick={signOut}>Log out</Button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-frankieGray">Welcome to Frankie AI!</p>
            <Button 
              size="sm" 
              className="bg-frankiePurple hover:bg-frankiePurple-dark"
              onClick={() => setShowAuth(true)}
            >
              Log in
            </Button>
          </div>
        )}
      </div>
      
      {/* Free tier banner */}
      {isAuthenticated && profile && !profile.is_pro && (
        <div className="bg-gray-100 p-2 text-center text-xs text-frankieGray">
          Free tier: up to 7 personas, for 7 days from signup. Upgrade anytime.
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        {showSettings ? (
          <SettingsComponent onBack={handleBackToPersonas} />
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
            {/* Search and settings */}
            <div className="flex mb-4 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search personas..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
                <Settings size={16} />
              </Button>
            </div>

            {/* Personas grid */}
            <div className="grid grid-cols-2 gap-4">
              {filteredPersonas.map((persona) => (
                <PersonaCard 
                  key={persona.id}
                  persona={persona}
                  onClick={() => selectPersona(persona.id)}
                />
              ))}
            </div>
            
            {filteredPersonas.length === 0 && (
              <div className="text-center py-10">
                <p className="text-frankieGray">No personas match your search</p>
              </div>
            )}
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
