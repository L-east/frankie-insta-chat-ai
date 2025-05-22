
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, X, LogOut, Clock, User, MessageCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { usePersonaStore } from "@/store/personaStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonaCard from './PersonaCard';
import PersonaDetail from './PersonaDetail';
import SettingsRefactored from './SettingsRefactored';
import Auth from './Auth';
import { getUserAgentsUsage } from '@/services/personaService';
import { useAuthStore } from '@/store/authStore';
import { MESSAGE_PACKAGES } from '@/services/personaService';

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
  const [activeTab, setActiveTab] = useState("personas");
  const [deploymentHistory, setDeploymentHistory] = useState<any[]>([]);
  const { signOut } = useAuth();
  
  const isAuthenticated = !!user;

  useEffect(() => {
    if (isAuthenticated) {
      fetchAgentsUsage();
      fetchDeploymentHistory();
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
  
  const fetchDeploymentHistory = async () => {
    try {
      if (!user) return;
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('persona_deployments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDeploymentHistory(data || []);
    } catch (error) {
      console.error('Error fetching deployment history:', error);
    }
  };
    
  const selectedPersona = getSelectedPersona();
  
  const handleBackToPersonas = () => {
    deselectPersona();
    setShowSettings(false);
    setActiveTab("personas");
  };
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return <span className="text-green-500">Active</span>;
      case 'finished': return <span className="text-gray-500">Finished</span>;
      case 'paused': return <span className="text-yellow-500">Paused</span>;
      default: return <span className="text-gray-500">{status}</span>;
    }
  };

  const getMessageQuotaInfo = () => {
    if (!agentsUsage) return null;
    
    const messagesUsed = agentsUsage.free_messages_used || 0;
    const messagesQuota = agentsUsage.free_messages_quota || 100;
    const expiryDate = agentsUsage.free_messages_expiry 
      ? new Date(agentsUsage.free_messages_expiry) 
      : null;
    
    const daysLeft = expiryDate 
      ? Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;
    
    const percentage = Math.min(100, Math.round((messagesUsed / messagesQuota) * 100));
    
    return {
      messagesUsed,
      messagesQuota,
      expiryDate,
      daysLeft,
      percentage
    };
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
        
        {/* Messages usage */}
        {isAuthenticated && agentsUsage && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Messages:</span>
              <span>{agentsUsage.free_messages_used || 0}/{agentsUsage.free_messages_quota || 100}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-frankiePurple h-1.5 rounded-full" 
                style={{ 
                  width: `${getMessageQuotaInfo()?.percentage || 0}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {showSettings ? (
          <div className="p-4">
            <SettingsRefactored onBack={handleBackToPersonas} />
          </div>
        ) : selectedPersonaId ? (
          <div className="p-4">
            {selectedPersona && (
              <PersonaDetail 
                persona={selectedPersona} 
                onBack={handleBackToPersonas} 
                onOpenAuth={() => setShowAuth(true)} 
              />
            )}
          </div>
        ) : (
          <div className="border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="personas">
                  <User size={16} className="mr-2" />
                  Personas
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock size={16} className="mr-2" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <div className="p-4">
                <TabsContent value="personas" className="space-y-4 mt-0">
                  {personas.map((persona) => (
                    <PersonaCard 
                      key={persona.id}
                      persona={persona}
                      onClick={() => selectPersona(persona.id)}
                      layout="horizontal"
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4 mt-0">
                  {deploymentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {deploymentHistory
                        .sort((a, b) => {
                          // First sort by status (active first)
                          if (a.status === 'active' && b.status !== 'active') return -1;
                          if (a.status !== 'active' && b.status === 'active') return 1;
                          // Then sort by created_at
                          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        })
                        .map((deployment) => (
                          <div key={deployment.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{
                                  personas.find(p => p.id === deployment.persona_id)?.name || 
                                  "Agent"
                                }</h4>
                                <div className="text-sm text-gray-500">
                                  Deployed {new Date(deployment.created_at).toLocaleDateString()}
                                </div>
                                <div className="mt-1">
                                  Status: {getStatusLabel(deployment.status || 'unknown')}
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div>Messages: {deployment.messages_sent || 0}/{deployment.message_count || 'N/A'}</div>
                                <div>Mode: {deployment.mode}</div>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No deployment history yet
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t text-center">
        <p className="text-xs text-frankieGray">© 2025 Frankie AI - v1.0.0</p>
      </div>
      
      {/* Auth modal */}
      {showAuth && (
        <Auth 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
        />
      )}
    </div>
  );
};

export default Sidebar;
