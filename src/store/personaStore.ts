
import { create } from 'zustand';

export interface Persona {
  id: string;
  name: string;
  description: string;
  attributes: string[];
  traits: string[];
  avatar_url: string;
  is_premium: boolean;
  perspective: string;
  behavior_snapshot: string;
  tags: string[];
  created_at: string;
  updated_at: string;
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
      attributes: ['romance', 'dating', 'flirty'],
      traits: ['romance', 'dating', 'flirty'],
      avatar_url: '/persona-avatars/casanova.jpg',
      is_premium: false,
      perspective: '1st',
      behavior_snapshot: 'Romantic tone, flirty language, evolves into "partner"',
      tags: ['romance', 'dating', 'flirty'],
      created_at: '',
      updated_at: ''
    },
    {
      id: 'cleopatra',
      name: 'Cleopatra',
      description: 'Regal, commanding, and seductive',
      attributes: ['power', 'royalty', 'seductive'],
      traits: ['power', 'royalty', 'seductive'],
      avatar_url: '/persona-avatars/cleopatra.jpg',
      is_premium: false,
      perspective: '1st',
      behavior_snapshot: 'Powerful, confident, subtle seduction',
      tags: ['power', 'royalty', 'seductive'],
      created_at: '',
      updated_at: ''
    },
    {
      id: 'gentleman',
      name: 'Gentleman',
      description: 'Polite, sophisticated, and well-mannered',
      attributes: ['polite', 'refined', 'classy'],
      traits: ['polite', 'refined', 'classy'],
      avatar_url: '/persona-avatars/gentleman.jpg', 
      is_premium: false,
      perspective: '1st',
      behavior_snapshot: 'Sophisticated language, courteous, refined',
      tags: ['polite', 'refined', 'classy'],
      created_at: '',
      updated_at: ''
    },
    {
      id: 'funny-guy',
      name: 'Funny Guy',
      description: 'Humorous, witty, and entertaining',
      attributes: ['humor', 'entertainment', 'fun'],
      traits: ['humor', 'entertainment', 'fun'],
      avatar_url: '/persona-avatars/funny-guy.jpg',
      is_premium: false,
      perspective: '1st',
      behavior_snapshot: 'Jokes, puns, light banter, one-liners for laughs',
      tags: ['humor', 'entertainment', 'fun'],
      created_at: '',
      updated_at: ''
    },
    {
      id: 'icebreaker',
      name: 'Icebreaker',
      description: 'Conversation starter and social catalyst',
      attributes: ['social', 'networking', 'dating'],
      traits: ['social', 'networking', 'dating'],
      avatar_url: '/persona-avatars/icebreaker.jpg',
      is_premium: false,
      perspective: '1st',
      behavior_snapshot: 'Wing-man style openers, situational chat starters',
      tags: ['social', 'networking', 'dating'],
      created_at: '',
      updated_at: ''
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
