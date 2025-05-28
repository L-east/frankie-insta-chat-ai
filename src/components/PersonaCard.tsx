
import React from 'react';
import { Persona } from '@/store/personaStore';
import { Badge } from "@/components/ui/badge";

interface PersonaCardProps {
  persona: Persona;
  onClick: () => void;
  layout?: 'horizontal' | 'vertical';
  readonly?: boolean;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ 
  persona, 
  onClick, 
  layout = 'vertical',
  readonly = false 
}) => {
  const handleClick = () => {
    if (!readonly) {
      onClick();
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 transition-all duration-200 ${
        readonly 
          ? 'cursor-default bg-gray-50' 
          : 'cursor-pointer hover:shadow-md hover:border-frankiePurple'
      } ${
        layout === 'horizontal' ? 'flex items-start space-x-4' : 'text-center'
      }`}
      onClick={handleClick}
    >
      <div className={layout === 'horizontal' ? 'flex-shrink-0' : ''}>
        <img 
          src={persona.avatar} 
          alt={persona.name}
          className={`rounded-full object-cover ${
            layout === 'horizontal' ? 'w-12 h-12' : 'w-16 h-16 mx-auto mb-3'
          }`}
        />
      </div>
      
      <div className={`flex-1 ${layout === 'horizontal' ? 'text-left' : ''}`}>
        <h3 className={`font-semibold mb-2 ${layout === 'horizontal' ? 'text-left' : 'text-center'}`}>
          {persona.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{persona.description}</p>
        
        <div className="flex flex-wrap gap-1 justify-start">
          {persona.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        {layout === 'horizontal' && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">{persona.behaviorSnapshot}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaCard;
