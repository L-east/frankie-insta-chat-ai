
import { create } from 'zustand';

export interface Persona {
  id: string;
  name: string;
  description: string;
  avatar: string;
  isPremium: boolean;
  perspective: '1st' | '2nd' | '3rd';
  behaviorSnapshot: string;
  tags: string[];
}

interface PersonaState {
  personas: Persona[];
  selectedPersonaId: string | null;
  isConfiguring: boolean;
  selectPersona: (id: string) => void;
  deselectPersona: () => void;
  getSelectedPersona: () => Persona | null;
  toggleConfigureMode: () => void;
}

export const usePersonaStore = create<PersonaState>((set, get) => ({
  personas: [
    {
      id: 'casanova',
      name: 'Casanova',
      description: 'Romantic, charming, and flirtatious - perfect for dating conversations',
      avatar: '/persona-avatars/casanova.jpg',
      isPremium: false,
      perspective: '1st',
      behaviorSnapshot: 'Romantic tone, flirty language, evolves into "partner"',
      tags: ['romance', 'dating', 'flirty']
    },
    {
      id: 'cleopatra',
      name: 'Cleopatra',
      description: 'Regal, commanding, and seductive - brings power and elegance',
      avatar: '/persona-avatars/cleopatra.jpg',
      isPremium: false,
      perspective: '1st',
      behaviorSnapshot: 'Powerful, confident, subtle seduction',
      tags: ['power', 'royalty', 'seductive']
    },
    {
      id: 'gentleman',
      name: 'Gentleman',
      description: 'Polite, sophisticated, and well-mannered - classic charm',
      avatar: '/persona-avatars/gentleman.jpg', 
      isPremium: false,
      perspective: '1st',
      behaviorSnapshot: 'Sophisticated language, courteous, refined',
      tags: ['polite', 'refined', 'classy']
    },
    {
      id: 'funny-guy',
      name: 'Funny Guy',
      description: 'Humorous, witty, and entertaining - keeps conversations light',
      avatar: '/persona-avatars/funny-guy.jpg',
      isPremium: false,
      perspective: '1st',
      behaviorSnapshot: 'Jokes, puns, light banter, one-liners for laughs',
      tags: ['humor', 'entertainment', 'fun']
    },
    {
      id: 'icebreaker',
      name: 'Icebreaker',
      description: 'Conversation starter and social catalyst - breaks the ice naturally',
      avatar: '/persona-avatars/icebreaker.jpg',
      isPremium: false,
      perspective: '1st',
      behaviorSnapshot: 'Wing-man style openers, situational chat starters',
      tags: ['social', 'networking', 'dating']
    }
  ],
  selectedPersonaId: null,
  isConfiguring: false,
  
  selectPersona: (id: string) => set({ selectedPersonaId: id }),
  deselectPersona: () => set({ selectedPersonaId: null }),
  getSelectedPersona: () => {
    const { personas, selectedPersonaId } = get();
    return personas.find(p => p.id === selectedPersonaId) || null;
  },
  toggleConfigureMode: () => set(state => ({ isConfiguring: !state.isConfiguring }))
}));
