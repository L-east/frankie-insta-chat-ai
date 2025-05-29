export interface Persona {
  id: string;
  name: string;
  description: string;
  attributes: string[];
  traits: string[];
  avatar_url?: string;
  isPremium?: boolean;
  perspective?: '1st' | '2nd' | '3rd';
  behaviorSnapshot?: string;
  tags: string[];
} 