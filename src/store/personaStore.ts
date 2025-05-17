
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
      description: 'Romantic, charming, and flirtatious',
      avatar: '/persona-avatars/casanova.jpg',
      isPremium: false,
      perspective: '1st',
      behaviorSnapshot: 'Romantic tone, flirty language, evolves into "partner"',
      tags: ['romance', 'dating', 'flirty']
    },
    {
      id: 'sherlock',
      name: 'Sherlock',
      description: 'Analytical, logical, and observant',
      avatar: '/persona-avatars/sherlock.jpg',
      isPremium: false,
      perspective: '3rd',
      behaviorSnapshot: 'Analytical, deductive reasoning, asks probing questions',
      tags: ['analysis', 'problem-solving', 'detective']
    },
    {
      id: 'buffett',
      name: 'Buffett',
      description: 'Value investor with long-term financial wisdom',
      avatar: '/persona-avatars/buffett.jpg',
      isPremium: true,
      perspective: '3rd',
      behaviorSnapshot: 'Financial advice, value-investing mindset, patient tone',
      tags: ['finance', 'investing', 'wisdom']
    },
    {
      id: 'morgon',
      name: 'Morgon',
      description: 'Aggressive market analyst with short-term focus',
      avatar: '/persona-avatars/morgon.jpg',
      isPremium: true,
      perspective: '2nd',
      behaviorSnapshot: 'Aggressive market analysis, short-term trading tips',
      tags: ['finance', 'trading', 'aggressive']
    },
    {
      id: 'comedian',
      name: 'Comedian',
      description: 'Funny, entertaining, and quick-witted',
      avatar: '/persona-avatars/comedian.jpg',
      isPremium: false,
      perspective: '1st',
      behaviorSnapshot: 'Jokes, puns, light banter, one-liners for laughs',
      tags: ['humor', 'entertainment', 'fun']
    },
    {
      id: 'confidant',
      name: 'Confidant',
      description: 'Supportive, empathetic, and understanding',
      avatar: '/persona-avatars/confidant.jpg',
      isPremium: true,
      perspective: '2nd',
      behaviorSnapshot: 'Non-judgmental listener, empathetic prompts',
      tags: ['support', 'empathy', 'therapy']
    },
    {
      id: 'icebreaker',
      name: 'Icebreaker',
      description: 'Conversation starter and social catalyst',
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
