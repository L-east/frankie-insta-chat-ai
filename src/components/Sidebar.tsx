
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, X, LogOut, Clock, User, MessageCircle, ChevronDown } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { usePersonaStore } from "@/store/personaStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonaCard from './PersonaCard';
import PersonaDetail from './PersonaDetail';
import SettingsRefactored from './SettingsRefactored';
import Auth from './Auth';
import AgentConfigDrawer from './AgentConfigDrawer';
import { PRICING_CONFIG } from '@/services/personaService';
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chatData?: any;
  onDeploy?: (config: any) => void;
}

const Sidebar = ({ isOpen, onClose, chatData, onDeploy }: SidebarProps) => {
  const { user, profile } = useAuth();
  const { personas, selectPersona, selectedPersonaId, getSelectedPersona, deselectPersona } = usePersonaStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("personas");
  const [deploymentHistory, setDeploymentHistory] = useState<any[]>([]);
  const [showAgentConfig, setShowAgentConfig] = useState(false);
  const { signOut } = useAuth();
  
  const isAuthenticated = !!user;

  useEffect(() => {
    if (isAuthenticated) {
      fetchDeploymentHistory();
    }
    
    // Always show personas tab by default
      setActiveTab("personas");
  }, [isAuthenticated, profile]);

  useEffect(() => {
    if (chatData && onDeploy) {
      setShowAgentConfig(true);
    }
  }, [chatData, onDeploy]);
  
  const fetchDeploymentHistory = async () => {
    try {
      if (!user) return;
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('user_deployments')
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
    setShowAgentConfig(false);
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
    if (!profile) return null;
    
    const messagesUsed = profile.free_messages_used || 0;
    const messagesQuota = profile.free_messages_quota || PRICING_CONFIG.FREE_MESSAGES;
    const expiryDate = profile.free_messages_expiry 
      ? new Date(profile.free_messages_expiry) 
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

  if (showAgentConfig && chatData && onDeploy) {
    return (
      <div className={`${isOpen ? 'block' : 'hidden'} fixed top-0 right-0 h-screen w-[400px] bg-white shadow-lg flex flex-col z-50`}>
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <div className="flex items-center space-x-2">
            <img 
              src="/assets/icon48.png" 
              alt="Frankie AI" 
              className="h-8 w-8"
            />
            <h1 className="text-lg font-bold">Frankie AI</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              console.log('Closing Frankie from Sidebar');
              setShowAgentConfig(false);
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({ action: 'closeFrankie' }, '*');
              }
              onClose();
            }}
            className="h-10 w-10"
          >
            <X size={18} />
          </Button>
        </div>
        <AgentConfigDrawer 
          isOpen={true}
          onClose={() => {
            console.log('Closing Frankie from AgentConfigDrawer');
            setShowAgentConfig(false);
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({ action: 'closeFrankie' }, '*');
            }
            onClose();
          }}
          chatData={chatData}
          onDeploy={onDeploy}
        />
      </div>
    );
  }

  return (
    <div className={`${isOpen ? 'block' : 'hidden'} fixed top-0 right-0 h-screen w-[400px] bg-white shadow-lg flex flex-col z-50`}>
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <div className="flex items-center space-x-2">
          <img 
            src="/assets/icon48.png" 
            alt="Frankie AI" 
            className="h-8 w-8"
          />
          <h1 className="text-lg font-bold">Frankie AI</h1>
        </div>
        <div className="flex items-center space-x-2">
          {isAuthenticated && (
            <>
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                <Settings size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut size={18} />
              </Button>
            </>
          )}
          {!isAuthenticated && (
            <Button 
              variant="ghost" 
              onClick={() => setShowAuth(true)}
              className="text-frankiePurple"
            >
              Login
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              console.log('Closing Frankie from main Sidebar');
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({ action: 'closeFrankie' }, '*');
              }
              onClose();
            }}
            className="h-10 w-10"
          >
            <X size={18} />
          </Button>
            </div>
        </div>
        
        {/* Messages usage */}
        {isAuthenticated && profile && (
        <div className="p-4 border-b bg-white">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Messages:</span>
              <span>{profile.free_messages_used || 0}/{profile.free_messages_quota || PRICING_CONFIG.FREE_MESSAGES}</span>
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

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-white">
        {showSettings ? (
          <div className="p-4">
            <SettingsRefactored onBack={handleBackToPersonas} />
          </div>
        ) : (
          <div className="border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full bg-white">
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
                  {!isAuthenticated ? (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <img 
                          src="/assets/icon48.png" 
                          alt="Frankie AI" 
                          className="h-16 w-16 mx-auto mb-4"
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Welcome to Frankie AI</h3>
                      <p className="text-gray-600 mb-4 text-sm">
                        Deploy AI personas to handle your Instagram conversations with style.
                      </p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <p>✨ 4 unique AI personas</p>
                        <p>📱 {PRICING_CONFIG.FREE_MESSAGES} free messages</p>
                        <p>⚡ One-click deployment</p>
                      </div>
                      <Button 
                        onClick={() => setShowAuth(true)}
                        className="mt-4 bg-frankiePurple hover:bg-frankiePurple-dark w-full"
                      >
                        Get Started
                      </Button>

                      {/* Meet our personas section */}
                      <div className="mt-8 text-left">
                        <h3 className="text-lg font-semibold mb-4">Meet our personas</h3>
                        <div className="space-y-4">
                          {personas.map((persona) => (
                            <div key={persona.id} className="border rounded-lg p-4">
                              <div className="flex items-start gap-4">
                                <img 
                                  src={persona.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} 
                                  alt={persona.name} 
                                  className="h-12 w-12 rounded-full"
                                />
                                <div className="flex-1">
                                  <h3 className="font-medium text-left">{persona.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{persona.description}</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {persona.traits?.map((trait: string, index: number) => (
                                      <Badge key={index} variant="secondary">
                                        {trait}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* How it works section */}
                      <div className="mt-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" className="w-full justify-between text-blue-800 hover:text-blue-900 hover:bg-blue-100">
                                <span className="font-medium">How it works</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-4">
                              <ol className="text-sm text-blue-700 space-y-2">
                                <li>1. Go to Instagram Direct Messages</li>
                                <li>2. With each chat you will see 'Deploy Frankie' button</li>
                                <li>3. Select a persona and configure other details, click "Deploy"</li>
                                <li>4. Your AI agent will start responding to messages</li>
                              </ol>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between text-blue-800 hover:text-blue-900 hover:bg-blue-100">
                              <span className="font-medium">How it works</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-4">
                            <ol className="text-sm text-blue-700 space-y-2">
                              <li>1. Go to Instagram Direct Messages</li>
                              <li>2. With each chat you will see 'Deploy Frankie' button</li>
                              <li>3. Select a persona and configure other details, click "Deploy"</li>
                              <li>4. Your AI agent will start responding to messages</li>
                            </ol>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                      <div className="space-y-4">
                        {personas.map((persona) => (
                          <div key={persona.id} className="border rounded-lg p-4">
                            <div className="flex items-start gap-4">
                              <img 
                                src={persona.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} 
                                alt={persona.name} 
                                className="h-12 w-12 rounded-full"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium text-left">{persona.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{persona.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {persona.traits?.map((trait: string, index: number) => (
                                    <Badge key={index} variant="secondary">
                                      {trait}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4 mt-0">
                  {deploymentHistory.length > 0 ? (
                    <div className="space-y-3">
                      {deploymentHistory
                        .sort((a, b) => {
                          if (a.status === 'active' && b.status !== 'active') return -1;
                          if (a.status !== 'active' && b.status === 'active') return 1;
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
                                <div>Pending: {deployment.message_count - (deployment.messages_sent || 0)}</div>
                                <div>Mode: {deployment.mode}</div>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between text-blue-800 hover:text-blue-900 hover:bg-blue-100">
                              <span className="font-medium">How it works</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-4">
                            <ol className="text-sm text-blue-700 space-y-2">
                              <li>1. Go to Instagram Direct Messages</li>
                              <li>2. With each chat you will see 'Deploy Frankie' button</li>
                              <li>3. Select a persona and configure other details, click "Deploy"</li>
                              <li>4. Your AI agent will start responding to messages</li>
                            </ol>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">No deployment history yet</p>
                      <p className="text-sm mt-1 text-gray-500">Deploy your first agent to see it here</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t text-center bg-white">
        <p className="text-xs text-frankieGray"></p>
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
