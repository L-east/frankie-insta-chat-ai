
interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface ChatData {
  id: string;
  participantName: string;
  messages: ChatMessage[];
}

export const extractChatMessages = (chatElement: HTMLElement | null): ChatMessage[] => {
  if (!chatElement) return [];
  
  // This is a simulation - in the actual extension, we would use DOM manipulation
  // to extract messages from the Instagram chat window
  
  // Example implementation - would be replaced with actual DOM extraction
  const messageElements = chatElement.querySelectorAll('.message-element');
  
  return Array.from(messageElements).map((element, index) => {
    return {
      id: `msg-${index}`,
      sender: element.querySelector('.sender')?.textContent || 'Unknown',
      content: element.querySelector('.content')?.textContent || '',
      timestamp: element.querySelector('.timestamp')?.textContent || new Date().toISOString()
    };
  });
};

export const getAllOpenChats = (): ChatData[] => {
  // This is a simulation - in the actual extension, we would use DOM manipulation
  // to find all open chat windows on the Instagram page
  
  // For demo purposes, returning placeholder data
  return [
    {
      id: 'chat-1',
      participantName: 'John Doe',
      messages: []
    },
    {
      id: 'chat-2',
      participantName: 'Jane Smith',
      messages: []
    }
  ];
};

export const injectReplyToChat = (chatId: string, message: string, typingEffect: boolean = true): Promise<void> => {
  return new Promise((resolve) => {
    // Find the text area for the specified chat
    const chatInput = document.querySelector(`#${chatId} textarea`);
    
    if (chatInput && chatInput instanceof HTMLTextAreaElement) {
      if (typingEffect) {
        // Simulate typing effect
        let i = 0;
        const typeInterval = setInterval(() => {
          if (i < message.length) {
            chatInput.value += message[i];
            i++;
          } else {
            clearInterval(typeInterval);
            resolve();
          }
        }, 20); // Speed of typing effect
      } else {
        // Set the value directly
        chatInput.value = message;
        resolve();
      }
    } else {
      console.error(`Chat input not found for chat ID: ${chatId}`);
      resolve();
    }
  });
};
