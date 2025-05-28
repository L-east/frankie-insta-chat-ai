
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Persona } from "@/store/personaStore";

interface PersonaCardProps {
  persona: Persona;
  onClick: () => void;
  isSelected?: boolean;
  layout?: 'vertical' | 'horizontal';
}

const PersonaCard: React.FC<PersonaCardProps> = ({ 
  persona, 
  onClick, 
  isSelected = false,
  layout = 'vertical'
}) => {
  const isHorizontal = layout === 'horizontal';
  
  return (
    <Card 
      className={`
        transition-all cursor-pointer 
        ${isSelected ? 'ring-2 ring-frankiePurple shadow-md' : 'hover:border-frankiePurple/50'} 
        ${isHorizontal ? 'p-3 flex items-center' : 'p-4'} 
      `} 
      onClick={onClick}
    >
      <div className={isHorizontal ? 'flex gap-3 w-full' : 'space-y-3'}>
        {/* Avatar */}
        <div className={`
          ${isHorizontal ? 'h-12 w-12 flex-shrink-0' : 'mx-auto h-20 w-20'} 
          rounded-full overflow-hidden bg-gray-200
        `}>
          <img 
            src={persona.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`} 
            alt={persona.name} 
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className={isHorizontal ? 'flex-grow' : 'text-center'}>
          {/* Name */}
          <h3 className={`font-semibold ${isHorizontal ? 'text-base' : 'text-lg mt-2'}`}>{persona.name}</h3>
          
          {/* Description - condensed for horizontal */}
          {!isHorizontal && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{persona.description}</p>}
          
          {/* Tags */}
          <div className={`${isHorizontal ? 'mt-1' : 'mt-2'} flex flex-wrap gap-1`}>
            {persona.tags.slice(0, isHorizontal ? 2 : 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {persona.tags.length > (isHorizontal ? 2 : 3) && (
              <Badge variant="outline" className="text-xs">
                +{persona.tags.length - (isHorizontal ? 2 : 3)}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaCard;
