import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Persona } from "@/store/personaStore";

interface PersonaCardProps {
  persona: Persona;
  onClick: () => void;
  isSelected?: boolean;
}

const PersonaCard = ({ persona, onClick, isSelected = false }: PersonaCardProps) => {
  return (
    <Card 
      className={`relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-2 ${
        isSelected ? 'border-green-500' : 'border-frankiePurple'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img 
              src={persona.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} 
              alt={persona.name} 
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{persona.name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {persona.tags.map((tag) => (
                <Badge variant="outline" key={tag} className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaCard;
