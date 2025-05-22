// Content script for the Frankie AI extension
console.log('Frankie AI content script loaded');

// State
let activeAgents = new Map();
let chatObservers = new Map();
let sidebar = null;

// Main function to initialize the extension
function initializeFrankieAI() {
  console.log('Initializing Frankie AI for Instagram');
  
  // Check if we're on a direct message page
  if (window.location.href.includes('/direct/') || window.location.href.includes('/messages/')) {
    console.log('Instagram messages page detected, initializing Frankie AI features');
    
    // Set up MutationObserver to detect when text areas appear
    observeTextAreas();
    
    // Initial scan for existing text areas
    injectDeployButtons();
  } else {
    console.log('Not on Instagram messages page, skipping button injection');
  }
}

// Observe the DOM for changes to detect new text areas
function observeTextAreas() {
  const textAreaObserver = new MutationObserver(function(mutations) {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        setTimeout(injectDeployButtons, 500); // Slight delay to ensure DOM is stable
      }
    }
  });
  
  // Observe changes in the main container
  const mainContainer = document.querySelector('body');
  if (mainContainer) {
    textAreaObserver.observe(mainContainer, { childList: true, subtree: true });
  }
}

// Inject deploy buttons into text areas
function injectDeployButtons() {
  // Check if we're on a direct message page
  if (!window.location.href.includes('/direct/') && !window.location.href.includes('/messages/')) {
    console.log('Not on Instagram messages page, skipping button injection');
    return;
  }

  // Find all chat editors
  const chatEditors = document.querySelectorAll('div[contenteditable="true"][role="textbox"][aria-label="Message"]');
  console.log('Found', chatEditors.length, 'chat editors');
  
  chatEditors.forEach((chat, index) => {
    // Generate a unique ID for this chat editor if it doesn't have one
    if (!chat.id) {
      chat.id = `chat-editor-${Date.now()}-${index}`;
    }
    
    console.log('Processing chat editor', chat.id);
    
    if (!chat.parentElement.querySelector('.deploy-wrapper-chat')) {
      console.log('Adding deploy button to chat editor', chat.id);
      const wrapper = document.createElement('div');
      wrapper.className = 'deploy-wrapper-chat';
      wrapper.style.display = 'inline-block';
      wrapper.style.marginTop = '10px';
      wrapper.style.marginRight = '8px';

      const button = document.createElement('button');
      button.textContent = 'Deploy Frankie';
      button.className = 'deploy-button';
      button.style.backgroundColor = '#9747FF';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '4px';
      button.style.padding = '4px 8px';
      button.style.fontSize = '12px';
      button.style.fontWeight = 'bold';
      button.style.cursor = 'pointer';
      
      // Add message icon
      const iconSpan = document.createElement('span');
      iconSpan.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
      iconSpan.style.marginRight = '4px';
      button.prepend(iconSpan);
      
      // Add hover effect
      button.onmouseover = function() {
        this.style.backgroundColor = '#8035E0';
      }
      button.onmouseout = function() {
        this.style.backgroundColor = '#9747FF';
      }

      wrapper.appendChild(button);
      
      // Find the submit button container and insert our button before it
      const submitContainer = chat.parentElement.querySelector('div[role="button"]')?.closest('div');
      if (submitContainer && submitContainer.parentNode) {
        submitContainer.parentNode.insertBefore(wrapper, submitContainer);
        console.log('Button inserted successfully for chat editor', chat.id);
      } else {
        chat.parentElement.appendChild(wrapper);
        console.log('Button appended to parent element (fallback) for chat editor', chat.id);
      }

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Deploy button clicked for chat editor', chat.id);
        handleDeployClick(chat);
      });
    }
  });
}

// Handle deploy button click
function handleDeployClick(chatInput) {
  console.log('Deploy button clicked, handling click event for chat editor', chatInput.id);
  
  // Use the chat editor's ID as the chat ID
  const chatId = chatInput.id;
  
  // Extract messages from the chat window
  const messages = extractChatMessages(chatInput);
  console.log('Extracted messages for chat editor', chatId, ':', messages);
  
  // Find the chat participant's name
  const participantName = extractParticipantName();
  console.log('Participant name for chat editor', chatId, ':', participantName);
  
  // Store chat data
  const chatData = {
    chatId,
    participantName,
    messages
  };
  
  // Open sidebar with config
  openSidebar(chatData);
}

// Extract messages from chat window
function extractChatMessages(chatInput) {
  try {
    // Find the chat container - this selector needs to be updated based on Instagram's structure
    const chatContainer = chatInput.closest('[role="dialog"]') || document.querySelector('main');
    if (!chatContainer) {
      console.error('Could not find chat container');
      return [];
    }
    
    const messageElements = chatContainer.querySelectorAll('[role="row"]');
    console.log('Found', messageElements.length, 'message elements');
    
    const messages = [];
    
    messageElements.forEach((element, index) => {
      try {
        // Determine sender - this logic needs to be updated based on Instagram's structure
        const isMyMessage = element.querySelector('[style*="margin-left: auto"]') !== null;
        const sender = isMyMessage ? 'user' : 'participant';
        
        // Extract message content
        const contentElement = element.querySelector('div[dir="auto"]');
        const content = contentElement ? contentElement.textContent : '';
        
        // Extract timestamp if available
        const timeElement = element.querySelector('time');
        const timestamp = timeElement ? timeElement.getAttribute('datetime') : new Date().toISOString();
        
        if (content) {
          messages.push({
            id: `msg-${index}`,
            sender,
            content,
            timestamp
          });
        }
      } catch (innerError) {
        console.error('Error processing individual message:', innerError);
      }
    });
    
    return messages;
  } catch (error) {
    console.error('Error extracting chat messages:', error);
    return [];
  }
}

// Extract participant name
function extractParticipantName() {
  try {
    // Find the chat header - this selector needs to be updated based on Instagram's structure
    const headerElement = document.querySelector('[role="dialog"] h1') || document.querySelector('main h1');
    return headerElement ? headerElement.textContent.trim() : 'User';
  } catch (error) {
    console.error('Error extracting participant name:', error);
    return 'User';
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'openSidebar') {
    console.log('Received openSidebar action');
    openSidebar();
    sendResponse({ success: true });
  }
  
  return true; // Keep channel open for async response
});

// Create and open the sidebar
function openSidebar(chatData = null) {
  console.log('Opening sidebar with chat data:', chatData);
  
  // Check if sidebar already exists
  if (!sidebar) {
    console.log('Creating new sidebar');
    // Create sidebar container
    sidebar = document.createElement('div');
    sidebar.id = 'frankie-sidebar';
    sidebar.style.position = 'fixed';
    sidebar.style.top = '0';
    sidebar.style.right = '0';
    sidebar.style.width = '320px';
    sidebar.style.height = '100%';
    sidebar.style.backgroundColor = 'white';
    sidebar.style.boxShadow = '-2px 0 10px rgba(0, 0, 0, 0.1)';
    sidebar.style.zIndex = '9999';
    sidebar.style.transition = 'transform 0.3s ease';
    sidebar.style.transform = 'translateX(100%)';
    
    // Create iframe to load our React app
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    // We need to use the extension URL to load the React app
    const extensionURL = chrome.runtime.getURL('index.html');
    console.log('Loading extension URL in iframe:', extensionURL);
    iframe.src = extensionURL;
    
    sidebar.appendChild(iframe);
    document.body.appendChild(sidebar);
    
    // Wait for iframe to load
    iframe.onload = function() {
      console.log('Iframe loaded successfully');
      if (chatData) {
        // Give the iframe some time to initialize React app before sending message
        setTimeout(() => {
          console.log('Sending chat data to iframe');
          iframe.contentWindow.postMessage({
            action: 'openAgentConfig',
            chatData
          }, '*');
        }, 1000);
      }
    };

    // Add error handling for iframe
    iframe.onerror = function(error) {
      console.error('Error loading iframe:', error);
    };
  } else {
    console.log('Using existing sidebar');
    // Send chat data to the iframe if provided
    const iframe = sidebar.querySelector('iframe');
    if (iframe && iframe.contentWindow && chatData) {
      console.log('Sending chat data to existing iframe');
      iframe.contentWindow.postMessage({
        action: 'openAgentConfig',
        chatData
      }, '*');
    }
  }
  
  // Show sidebar with a slight delay to ensure smooth animation
  setTimeout(() => {
    sidebar.style.transform = 'translateX(0)';
    console.log('Sidebar animation started');
  }, 10);
  
  // Add close button
  addSidebarCloseButton(sidebar);
}

// Add close button to sidebar
function addSidebarCloseButton(sidebar) {
  let closeButton = sidebar.querySelector('.frankie-close-button');
  if (!closeButton) {
    closeButton = document.createElement('button');
    closeButton.className = 'frankie-close-button';
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.zIndex = '10000';
    
    closeButton.onclick = function() {
      sidebar.style.transform = 'translateX(100%)';
    };
    
    sidebar.appendChild(closeButton);
  }
}

// Inject text into chat input with typing effect
function injectReplyToChat(chatId, message, typingEffect = true) {
  console.log('Injecting reply to chat:', chatId, message, typingEffect);
  return new Promise((resolve) => {
    // Find the textarea for the specified chat using the chat ID
    const chatInput = document.getElementById(chatId);
    
    if (chatInput) {
      console.log('Found chat input for chat ID:', chatId, 'injecting text');
      
      if (typingEffect) {
        // Simulate typing effect
        chatInput.focus();
        chatInput.innerHTML = '';
        
        let i = 0;
        const typeInterval = setInterval(() => {
          if (i < message.length) {
            // Use execCommand for contenteditable divs
            document.execCommand('insertText', false, message[i]);
            
            // Trigger input event to update Instagram's internal state
            const inputEvent = new Event('input', { bubbles: true });
            chatInput.dispatchEvent(inputEvent);
            
            i++;
          } else {
            clearInterval(typeInterval);
            console.log('Finished typing effect for chat ID:', chatId);
            
            // If auto mode, trigger submit after typing
            const agentInstance = Array.from(activeAgents.values())
              .find(agent => agent.chatId === chatId);
              
            if (agentInstance?.config.mode === 'auto') {
              setTimeout(() => {
                // Find and click the send button
                const sendButton = chatInput.parentElement.querySelector('[type="submit"]');
                if (sendButton) {
                  sendButton.click();
                  console.log('Message sent automatically for chat ID:', chatId);
                }
              }, 500);
            }
            
            resolve();
          }
        }, 20); // Speed of typing effect
      } else {
        // Set the value directly
        chatInput.innerHTML = message;
        
        // Trigger input event to update Instagram's internal state
        const inputEvent = new Event('input', { bubbles: true });
        chatInput.dispatchEvent(inputEvent);
        console.log('Text injected without typing effect for chat ID:', chatId);
        
        resolve();
      }
    } else {
      console.error(`Chat input not found for chat ID: ${chatId}`);
      resolve();
    }
  });
}

// Listen for messages from React app in iframe
window.addEventListener('message', function(event) {
  console.log('Window received message:', event.data);
  
  if (event.data && event.data.action === 'deployAgent') {
    console.log('Deploying agent with config:', event.data.config);
    deployAgent(event.data.config);
  }
  
  if (event.data && event.data.action === 'closeSidebar') {
    const sidebar = document.getElementById('frankie-sidebar');
    if (sidebar) {
      sidebar.style.transform = 'translateX(100%)';
    }
  }
});

// Deploy AI agent
function deployAgent(config) {
  console.log('Deploying agent with config:', config);
  
  const agentId = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const chatId = config.chatData.chatId;
  
  let timeoutId;
  let messagesSent = 0;
  let isWaitingForReply = false;
  
  // Setup chat message observer
  setupChatObserver(chatId);
  
  const processChat = async () => {
    if (isWaitingForReply) return;
    
    // Check if time limit has been reached
    if (config.time_limit) {
      const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
      if (elapsedMinutes >= config.time_limit) {
        stopAgent();
        return;
      }
    }
    
    // Check if message count has been reached
    if (config.message_count && messagesSent >= config.message_count) {
      stopAgent();
      return;
    }
    
    // Generate AI response
    try {
      const response = await generateAIResponse(config);
      
      // For auto mode, inject the response with typing effect
      if (config.mode === 'auto') {
        await injectReplyToChat(chatId, response, true);
        messagesSent++;
        
        // Simulate waiting for reply before sending next message
        isWaitingForReply = true;
        setTimeout(() => {
          isWaitingForReply = false;
        }, 30000 + Math.random() * 60000); // Random wait between 30-90 seconds
      } 
      // For manual mode, just inject the text without sending
      else {
        await injectReplyToChat(chatId, response, false);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  };
  
  const stopAgent = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Remove chat observer
    const observer = chatObservers.get(chatId);
    if (observer) {
      observer.disconnect();
      chatObservers.delete(chatId);
    }
    
    // Notify backend to end conversation
    try {
      await fetch('http://localhost:5000/end-conversation', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ chat_id: chatId })
      });
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
    
    activeAgents.delete(agentId);
    console.log(`Agent ${agentId} stopped`);
  };
  
  const startTime = Date.now();
  
  // Create agent instance
  const agentInstance = {
    id: agentId,
    config,
    status: 'active',
    startTime,
    messagesSent,
    stop: stopAgent,
    chatId
  };
  
  // Set up time limit if specified
  if (config.time_limit) {
    const timeoutMs = config.time_limit * 60 * 1000;
    timeoutId = setTimeout(stopAgent, timeoutMs);
  }
  
  // Start processing the chat
  processChat();
  
  activeAgents.set(agentId, agentInstance);
  return agentInstance;
}

// Setup chat observer to detect new messages
function setupChatObserver(chatId) {
  // Find the chat container
  const chatForm = document.querySelector('form');
  const chatContainer = chatForm ? chatForm.closest('[role="dialog"]') || document.querySelector('main') : null;
  
  if (!chatContainer) return;
  
  // Check if observer already exists
  if (chatObservers.has(chatId)) {
    chatObservers.get(chatId).disconnect();
  }
  
  // Create observer
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        // New message detected
        const agentInstance = Array.from(activeAgents.values())
          .find(agent => agent.config.chatData.chatId === chatId);
        
        if (agentInstance && agentInstance.status === 'active') {
          // Update the isWaitingForReply flag
          agentInstance.isWaitingForReply = false;
          
          // Process chat with some delay to seem more natural
          setTimeout(() => {
            processChat(agentInstance);
          }, 5000 + Math.random() * 5000); // Random delay between 5-10 seconds
        }
      }
    }
  });
  
  // Start observing
  observer.observe(chatContainer, { childList: true, subtree: true });
  chatObservers.set(chatId, observer);
}

// Process chat for an agent instance
async function processChat(agentInstance) {
  if (agentInstance.isWaitingForReply) return;
  
  // Check if time limit has been reached
  if (agentInstance.config.time_limit) {
    const elapsedMinutes = (Date.now() - agentInstance.startTime) / (1000 * 60);
    if (elapsedMinutes >= agentInstance.config.time_limit) {
      agentInstance.stop();
      return;
    }
  }
  
  // Check if message count has been reached
  if (agentInstance.config.message_count && agentInstance.messagesSent >= agentInstance.config.message_count) {
    agentInstance.stop();
    return;
  }
  
  // Extract latest messages
  const chatForm = document.querySelector('form');
  const messages = extractChatMessages(chatForm.querySelector('[contenteditable="true"][role="textbox"][aria-label="Message"]'));
  
  // Update agent's messages
  agentInstance.config.chatData.messages = messages;
  
  // Generate AI response
  try {
    const response = await generateAIResponse(agentInstance.config);
    
    // For auto mode, inject the response with typing effect
    if (agentInstance.config.mode === 'auto') {
      await injectReplyToChat(agentInstance.config.chatData.chatId, response, true);
      agentInstance.messagesSent++;
      
      // Simulate waiting for reply before sending next message
      agentInstance.isWaitingForReply = true;
    } 
    // For manual mode, just inject the text without sending
    else {
      await injectReplyToChat(agentInstance.config.chatData.chatId, response, false);
    }
  } catch (error) {
    console.error('Error generating AI response:', error);
  }
}

// Simulate LLM API call
async function generateAIResponse(config) {
  console.log('Generating response for:', config);
  
  try {
    const apiUrl = 'http://localhost:5000/process-text';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: config.chatData.chatId,
        prime_directive: config.custom_prompt || '', 
        text: JSON.stringify(config.chatData.messages),
        persona: {
          id: config.persona.id || 'default',
          name: config.persona.name || 'AI Assistant',
          description: config.persona.description || '',
          behaviorSnapshot: config.persona.behaviorSnapshot || ''
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.error) {
        console.error('Error from API:', data.error);
        throw new Error(data.error);
      }
      return data.processed_text || "Thanks for your message! I'm here to chat whenever you're ready.";
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get response from API');
    }
  } catch (error) {
    console.error('Error calling API:', error);
    
    // Fallback responses based on persona if API fails
    switch (config.persona.id) {
      case 'casanova':
        return "Hey there! I couldn't help but notice your message. How's your day going? 💫";
      case 'cleopatra':
        return "I admire your attention to detail. Let's continue this fascinating dialogue.";
      case 'gentleman':
        return "It's a pleasure to chat with you. Perhaps we could discuss this topic further sometime?";
      case 'funny-guy':
        return "Why don't scientists trust atoms? Because they make up everything! 😂";
      case 'icebreaker':
        return "So, what's the most exciting thing that happened to you this week?";
      default:
        return "Thanks for your message! I'm here to chat whenever you're ready.";
    }
  }
}

// Initialize when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded event fired');
  // Delay initialization to ensure Instagram's UI is fully loaded
  setTimeout(initializeFrankieAI, 2000);
});

// Check if we're already on the messages page and initialize immediately
if (document.readyState !== 'loading') {
  console.log('Document already ready, initializing Frankie AI');
  setTimeout(initializeFrankieAI, 1000);
} else {
  console.log('Document not ready yet, will initialize on DOMContentLoaded');
}

// Also check periodically for new chat elements (Instagram loads dynamically)
setInterval(() => {
  if (window.location.href.includes('/direct/') || window.location.href.includes('/messages/')) {
    const isMessagePage = document.querySelectorAll('div[contenteditable="true"][role="textbox"][aria-label="Message"]').length > 0;
    if (isMessagePage) {
      injectDeployButtons();
    }
  }
}, 5000);
