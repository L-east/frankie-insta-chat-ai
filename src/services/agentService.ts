import { PersonaDeploymentData } from './personaService';
import { injectReplyToChat } from './chatService';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface Persona {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  isPremium: boolean;
  perspective: '1st' | '2nd' | '3rd';
  behaviorSnapshot: string;
  tags: string[];
}

interface AgentConfig extends PersonaDeploymentData {
  persona: Persona;
  chatData: {
    chatId: string;
    messages: ChatMessage[];
  };
}

interface AgentInstance {
  id: string;
  config: AgentConfig;
  status: 'active' | 'paused' | 'stopped';
  startTime: number;
  messagesSent: number;
  stop: () => void;
}

const activeAgents: Map<string, AgentInstance> = new Map();

// Simulate LLM API call
const generateAIResponse = async (
  messages: ChatMessage[], 
  persona: Persona,
  customPrompt?: string,
  toneStrength?: number
): Promise<string> => {
  // In a real implementation, this would make an API call to an LLM
  console.log('Generating response for:', { messages, persona, customPrompt, toneStrength });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a simple response based on persona
  let response = '';
  
  switch (persona.id) {
    case 'casanova':
      response = "Hey there! I couldn't help but notice your message. How's your day going? 💫";
      break;
    case 'sherlock':
      response = "Interesting. Based on our conversation, I deduce you're looking for a thoughtful response.";
      break;
    case 'confidant':
      response = "I understand how you feel. It's completely normal to have those thoughts.";
      break;
    case 'comedian':
      response = "Why don't scientists trust atoms? Because they make up everything! 😂";
      break;
    case 'icebreaker':
      response = "So, what's the most exciting thing that happened to you this week?";
      break;
    default:
      response = "Thanks for your message! I'm here to chat whenever you're ready.";
  }
  
  if (customPrompt) {
    response += " (Following your custom instructions)";
  }
  
  return response;
};

export const deployAgent = (config: AgentConfig): AgentInstance => {
  const agentId = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  let timeoutId: number | undefined;
  let intervalId: number | undefined;
  let isWaitingForReply = false;
  
  const processChat = async () => {
    if (isWaitingForReply) return;
    
    // Check if time limit has been reached
    if (config.time_limit) {
      const elapsedMinutes = (Date.now() - instance.startTime) / (1000 * 60);
      if (elapsedMinutes >= config.time_limit) {
        stopAgent();
        return;
      }
    }
    
    // Check if message count has been reached
    if (config.message_count && instance.messagesSent >= config.message_count) {
      stopAgent();
      return;
    }
    
    const response = await generateAIResponse(
      config.chatData.messages,
      config.persona,
      config.custom_prompt,
      config.tone_strength
    );
    
    // For auto mode, inject the response with typing effect
    if (config.mode === 'auto') {
      await injectReplyToChat(config.chatData.chatId, response, true);
      
      // Simulate sending the message
      console.log('Auto-sending message:', response);
      instance.messagesSent++;
      
      // Simulate waiting for reply before sending next message
      isWaitingForReply = true;
      setTimeout(() => {
        isWaitingForReply = false;
      }, 30000 + Math.random() * 60000); // Random wait between 30-90 seconds
    } 
    // For manual mode, just inject the text without sending
    else {
      await injectReplyToChat(config.chatData.chatId, response, false);
    }
  };
  
  const stopAgent = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    instance.status = 'stopped';
    activeAgents.delete(agentId);
    console.log(`Agent ${agentId} stopped`);
  };
  
  const instance: AgentInstance = {
    id: agentId,
    config,
    status: 'active',
    startTime: Date.now(),
    messagesSent: 0,
    stop: stopAgent
  };
  
  // Set up time limit if specified
  if (config.time_limit) {
    const timeoutMs = config.time_limit * 60 * 1000;
    timeoutId = setTimeout(stopAgent, timeoutMs) as unknown as number;
  }
  
  // Start processing the chat
  processChat();
  
  // For auto mode, set up interval to check for new messages
  if (config.mode === 'auto') {
    intervalId = setInterval(processChat, 15000 + Math.random() * 15000) as unknown as number;
  }
  
  activeAgents.set(agentId, instance);
  return instance;
};

export const stopAllAgents = () => {
  for (const agent of activeAgents.values()) {
    agent.stop();
  }
};

export const getActiveAgents = (): AgentInstance[] => {
  return Array.from(activeAgents.values());
};
