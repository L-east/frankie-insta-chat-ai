
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PersonaCardProps {
  persona: {
    id: string;
    name: string;
    description: string;
    image: string;
    traits: string[];
    specialties: string[];
  };
  onClick?: () => void;
  layout?: 'horizontal' | 'vertical';
  showDeployButton?: boolean;
  disabled?: boolean;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ 
  persona, 
  onClick, 
  layout = 'horizontal',
  showDeployButton = false,
  disabled = false
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  if (layout === 'vertical') {
    return (
      <Card className={`h-full ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'} transition-all duration-200`}>
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-center mb-4">
            <img 
              src={persona.image} 
              alt={persona.name}
              className="w-16 h-16 rounded-full object-cover mr-4"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-left">{persona.name}</h3>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 flex-1">{persona.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {persona.traits.map((trait, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>

          {showDeployButton && (
            <Button 
              onClick={handleClick}
              disabled={disabled}
              className="w-full bg-frankiePurple hover:bg-frankiePurple-dark"
            >
              Deploy {persona.name}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'} transition-all duration-200`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <img 
            src={persona.image} 
            alt={persona.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-left">{persona.name}</h3>
            <p className="text-sm text-gray-600">{persona.description}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {persona.traits.slice(0, 2).map((trait, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {trait}
            </Badge>
          ))}
          {persona.traits.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{persona.traits.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonaCard;
