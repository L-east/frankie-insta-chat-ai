
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Persona } from "@/store/personaStore";
import { useAuthStore } from "@/store/authStore";
import { Lock } from "lucide-react";

interface PersonaCardProps {
  persona: Persona;
  onClick: () => void;
}

const PersonaCard = ({ persona, onClick }: PersonaCardProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const isLocked = persona.isPremium && (!isAuthenticated || (isAuthenticated && !user?.isPro));

  return (
    <Card 
      className={`relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-2 ${
        isLocked ? 'border-gray-200' : 'border-frankiePurple'
      }`}
      onClick={onClick}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-10">
          <Lock size={24} className="text-frankieGray mb-2" />
          <span className="text-frankieGray font-medium">Premium</span>
          <Button variant="outline" className="mt-2 text-xs hover:bg-frankiePurple hover:text-white" onClick={(e) => {
            e.stopPropagation();
            // This would redirect to upgrade page
          }}>
            Unlock
          </Button>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full overflow-hidden mb-3 bg-gray-200">
            <img 
              src={persona.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} 
              alt={persona.name} 
              className="h-full w-full object-cover"
            />
          </div>
          
          <h3 className="font-bold text-lg">{persona.name}</h3>
          <p className="text-frankieGray text-sm text-center mt-1">{persona.description}</p>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0 flex flex-wrap gap-1 justify-center">
        {persona.tags.map((tag) => (
          <Badge variant="outline" key={tag} className="text-xs">
            {tag}
          </Badge>
        ))}
      </CardFooter>
      
      {/* Tier badge */}
      <div className="absolute top-2 right-2">
        <Badge className={persona.isPremium ? "bg-amber-400 text-black" : "bg-frankiePurple"}>
          {persona.isPremium ? "PRO" : "FREE"}
        </Badge>
      </div>
    </Card>
  );
};

export default PersonaCard;
