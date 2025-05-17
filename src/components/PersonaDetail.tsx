
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader } from "lucide-react";
import { Persona } from "@/store/personaStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/use-toast";

interface PersonaDetailProps {
  persona: Persona;
  onBack: () => void;
  onOpenAuth: () => void;
}

const PersonaDetail = ({ persona, onBack, onOpenAuth }: PersonaDetailProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Form state
  const [scope, setScope] = useState<'current'|'all'|'bulk'>('current');
  const [customPrompt, setCustomPrompt] = useState('');
  const [toneStrength, setToneStrength] = useState([5]);
  const [flagKeywords, setFlagKeywords] = useState('');
  const [flagAction, setFlagAction] = useState('pause');
  const [timeLimit, setTimeLimit] = useState('');
  const [messageCount, setMessageCount] = useState('');
  const [autoStop, setAutoStop] = useState(true);
  const [mode, setMode] = useState<'auto'|'manual'>('auto');

  const handleDeploy = () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    
    setIsDeploying(true);
    
    // Mock deployment
    setTimeout(() => {
      setIsDeploying(false);
      toast({
        title: `${persona.name} deployed!`,
        description: "Your AI agent is now active in the chat.",
      });
    }, 2000);
  };

  const isDeployDisabled = () => {
    if (!isAuthenticated) return false; // We'll show "Log in to Deploy" instead
    if (user?.isPro) return false; // Pro users have unlimited deploys
    if ((user?.freeAgentsUsed || 0) >= (user?.freeAgentsTotal || 0)) return true; // Free tier exhausted
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
            <img 
              src={persona.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} 
              alt={persona.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{persona.name}</h2>
              <Badge className={persona.isPremium ? "bg-amber-400 text-black" : "bg-frankiePurple"}>
                {persona.isPremium ? "PRO" : "FREE"}
              </Badge>
            </div>
            <p className="text-frankieGray text-sm">{persona.behaviorSnapshot}</p>
          </div>
        </div>
      </div>

      {/* Configuration sections */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scope of Task</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={scope} onValueChange={(value) => setScope(value as 'current'|'all'|'bulk')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current">Current Chat (only active thread)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All Chats on Page (scan every open conversation)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bulk" id="bulk" disabled={!user?.isPro} />
                <Label htmlFor="bulk" className={!user?.isPro ? "text-gray-400" : ""}>
                  Bulk Upload Contacts (CSV input)
                  {!user?.isPro && <span className="ml-2 text-xs">(Pro feature)</span>}
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Behavior Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-prompt">Custom Prompt (optional)</Label>
              <Textarea 
                id="custom-prompt" 
                placeholder="Add a custom opening message or specific instructions..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="tone-strength">Tone Strength</Label>
                <span className="text-sm font-medium">{toneStrength[0]}/10</span>
              </div>
              <Slider 
                id="tone-strength" 
                value={toneStrength} 
                min={1} 
                max={10} 
                step={1}
                onValueChange={setToneStrength} 
              />
              <div className="flex justify-between text-xs text-frankieGray">
                <span>Subtle</span>
                <span>Strong</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="flag-keywords">Flag Keywords</Label>
                <Input 
                  id="flag-keywords" 
                  placeholder="comma, separated, words"
                  value={flagKeywords}
                  onChange={(e) => setFlagKeywords(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="flag-action">On Flag</Label>
                <Select value={flagAction} onValueChange={setFlagAction}>
                  <SelectTrigger id="flag-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pause">Pause</SelectItem>
                    <SelectItem value="notify">Notify</SelectItem>
                    <SelectItem value="continue">Continue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input 
                  id="time-limit" 
                  placeholder="e.g. 30"
                  type="number" 
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="message-count">Message Count</Label>
                <Input 
                  id="message-count" 
                  placeholder="e.g. 10"
                  type="number"
                  value={messageCount}
                  onChange={(e) => setMessageCount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="auto-stop" 
                checked={autoStop}
                onChange={(e) => setAutoStop(e.target.checked)}
                className="rounded border-gray-300 text-frankiePurple focus:ring-frankiePurple"
              />
              <Label htmlFor="auto-stop">Auto-stop on conclusion (detect "goodbye," "thanks," etc.)</Label>
            </div>
            
            <fieldset>
              <legend className="text-sm font-medium mb-2">Mode</legend>
              <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'auto'|'manual')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="auto" id="auto" />
                  <Label htmlFor="auto">Fully Auto (agent sends directly)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual">Semi-Manual (agent drafts in sidebar, you click to send)</Label>
                </div>
              </RadioGroup>
            </fieldset>
            
            {/* Usage Counter */}
            {isAuthenticated && !user?.isPro && (
              <div className="text-xs text-frankieGray mt-4">
                You've deployed {user?.freeAgentsUsed}/{user?.freeAgentsTotal} free agents. 
                Expires in {Math.ceil((user?.freeExpiryDate.getTime() || 0 - Date.now()) / (1000 * 60 * 60 * 24))} days.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Cancel</Button>
        <Button 
          onClick={handleDeploy} 
          disabled={isDeployDisabled() || isDeploying}
          className="bg-frankiePurple hover:bg-frankiePurple-dark"
        >
          {isDeploying ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Deploying...
            </>
          ) : !isAuthenticated ? (
            "Log in to Deploy"
          ) : (
            "Save & Deploy"
          )}
        </Button>
      </div>
    </div>
  );
};

export default PersonaDetail;
