
// Content script for the Frankie AI extension
console.log('Frankie AI content script loaded');

// State
let activeAgents = new Map();
let chatObservers = new Map();

// Main function to initialize the extension
function initializeFrankieAI() {
  console.log('Initializing Frankie AI for Instagram');
  
  // Check if we're on the Instagram messages page
  if (window.location.href.includes('instagram.com/direct/') || window.location.href.includes('instagram.com/messages/')) {
    console.log('Instagram messages detected, setting up deploy buttons');
    
    // Set up MutationObserver to detect when chat windows appear
    observeChatWindows();
    
    // Initial scan for existing chat windows
    injectDeployButtons();
  }
}

// Observe the DOM for changes to detect new chat windows
function observeChatWindows() {
  const chatContainerObserver = new MutationObserver(function(mutations) {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        setTimeout(injectDeployButtons, 500); // Slight delay to ensure DOM is stable
      }
    }
  });
  
  // Observe changes in the main container where chat windows appear
  const mainContainer = document.querySelector('body');
  if (mainContainer) {
    chatContainerObserver.observe(mainContainer, { childList: true, subtree: true });
  }
}

// Inject deploy buttons into chat windows
function injectDeployButtons() {
  // Find all chat input areas - this selector needs to be updated based on Instagram's structure
  const chatInputs = document.querySelectorAll('form textarea');
  
  chatInputs.forEach(input => {
    const parentForm = input.closest('form');
    if (parentForm && !parentForm.querySelector('.frankie-deploy-button')) {
      console.log('Found chat input, adding deploy button');
      
      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'frankie-deploy-button';
      buttonContainer.style.display = 'inline-block';
      buttonContainer.style.marginRight = '8px';
      
      // Create button
      const deployButton = document.createElement('button');
      deployButton.className = 'frankie-button';
      deployButton.textContent = 'Deploy Frankie';
      deployButton.style.backgroundColor = '#9747FF';
      deployButton.style.color = 'white';
      deployButton.style.border = 'none';
      deployButton.style.borderRadius = '4px';
      deployButton.style.padding = '4px 8px';
      deployButton.style.fontSize = '12px';
      deployButton.style.fontWeight = 'bold';
      deployButton.style.cursor = 'pointer';
      
      // Add message icon
      const iconSpan = document.createElement('span');
      iconSpan.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
      iconSpan.style.marginRight = '4px';
      deployButton.prepend(iconSpan);
      
      // Add hover effect
      deployButton.onmouseover = function() {
        this.style.backgroundColor = '#8035E0';
      }
      deployButton.onmouseout = function() {
        this.style.backgroundColor = '#9747FF';
      }
      
      // Add click handler
      deployButton.onclick = function(e) {
        e.preventDefault();
        handleDeployClick(parentForm);
      };
      
      // Add button to DOM - find the right place to insert based on Instagram's structure
      buttonContainer.appendChild(deployButton);
      
      // Find the submit button container and insert our button before it
      const submitContainer = parentForm.querySelector('div[role="button"]').closest('div');
      if (submitContainer && submitContainer.parentNode) {
        submitContainer.parentNode.insertBefore(buttonContainer, submitContainer);
      }
    }
  });
}

// Handle deploy button click
function handleDeployClick(chatForm) {
  console.log('Deploy button clicked');
  
  // Get chat ID - we'll use the form element as a unique identifier
  const chatId = 'chat-' + Date.now();
  
  // Extract messages from the chat window
  const messages = extractChatMessages(chatForm);
  
  // Find the chat participant's name
  const participantName = extractParticipantName();
  
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
function extractChatMessages(chatForm) {
  // Find the chat container - this selector needs to be updated based on Instagram's structure
  const chatContainer = chatForm.closest('[role="dialog"]') || document.querySelector('main');
  const messageElements = chatContainer.querySelectorAll('[role="row"]');
  
  const messages = [];
  
  messageElements.forEach((element, index) => {
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
  });
  
  return messages;
}

// Extract participant name
function extractParticipantName() {
  // Find the chat header - this selector needs to be updated based on Instagram's structure
  const headerElement = document.querySelector('[role="dialog"] h1') || document.querySelector('main h1');
  return headerElement ? headerElement.textContent.trim() : 'User';
}

// Create and open the sidebar
function openSidebar(chatData) {
  // Check if sidebar already exists
  let sidebar = document.getElementById('frankie-sidebar');
  if (!sidebar) {
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
    iframe.src = chrome.runtime.getURL('index.html');
    
    sidebar.appendChild(iframe);
    document.body.appendChild(sidebar);
    
    // Wait for iframe to load
    iframe.onload = function() {
      // Send chat data to the iframe
      iframe.contentWindow.postMessage({
        action: 'openAgentConfig',
        chatData
      }, '*');
    };
  } else {
    // Send chat data to the iframe
    const iframe = sidebar.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        action: 'openAgentConfig',
        chatData
      }, '*');
    }
  }
  
  // Show sidebar
  setTimeout(() => {
    sidebar.style.transform = 'translateX(0)';
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
  return new Promise((resolve) => {
    // Find the textarea for the specified chat
    const chatForm = document.querySelector(`form`);
    const chatInput = chatForm ? chatForm.querySelector('textarea') : null;
    
    if (chatInput && chatInput instanceof HTMLTextAreaElement) {
      if (typingEffect) {
        // Simulate typing effect
        chatInput.focus();
        chatInput.value = '';
        
        let i = 0;
        const typeInterval = setInterval(() => {
          if (i < message.length) {
            chatInput.value += message[i];
            
            // Trigger input event to update Instagram's internal state
            const inputEvent = new Event('input', { bubbles: true });
            chatInput.dispatchEvent(inputEvent);
            
            i++;
          } else {
            clearInterval(typeInterval);
            
            // If auto mode, trigger submit after typing
            if (activeAgents.get(chatId)?.config.mode === 'auto') {
              setTimeout(() => {
                // Find and click the send button
                const sendButton = chatForm.querySelector('[type="submit"]');
                if (sendButton) {
                  sendButton.click();
                  console.log('Message sent automatically');
                }
              }, 500);
            }
            
            resolve();
          }
        }, 20); // Speed of typing effect
      } else {
        // Set the value directly
        chatInput.value = message;
        
        // Trigger input event to update Instagram's internal state
        const inputEvent = new Event('input', { bubbles: true });
        chatInput.dispatchEvent(inputEvent);
        
        resolve();
      }
    } else {
      console.error(`Chat input not found for chat ID: ${chatId}`);
      resolve();
    }
  });
}

// Deploy AI agent
function deployAgent(config) {
  console.log('Deploying agent with config:', config);
  
  const agentId = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  let timeoutId;
  let messagesSent = 0;
  let isWaitingForReply = false;
  
  // Setup chat message observer
  setupChatObserver(config.chatData.chatId);
  
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
        await injectReplyToChat(config.chatData.chatId, response, true);
        messagesSent++;
        
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
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  };
  
  const stopAgent = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Remove chat observer
    const observer = chatObservers.get(config.chatData.chatId);
    if (observer) {
      observer.disconnect();
      chatObservers.delete(config.chatData.chatId);
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
    stop: stopAgent
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
  const messages = extractChatMessages(chatForm);
  
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
  
  // In a real implementation, this would make an API call to an LLM
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a response based on persona
  let response = '';
  
  switch (config.persona.id) {
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
  
  if (config.custom_prompt) {
    response += " (Following your custom instructions)";
  }
  
  return response;
}

// Listen for messages from React app in iframe
window.addEventListener('message', function(event) {
  if (event.data && event.data.action === 'deployAgent') {
    deployAgent(event.data.config);
  }
  
  if (event.data && event.data.action === 'closeSidebar') {
    const sidebar = document.getElementById('frankie-sidebar');
    if (sidebar) {
      sidebar.style.transform = 'translateX(100%)';
    }
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received in content script:', request);
  
  if (request.action === 'deployAgent') {
    deployAgent(request.config);
    sendResponse({ success: true });
  }
  
  return true; // Required for async sendResponse
});

// Initialize when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Delay initialization to ensure Instagram's UI is fully loaded
  setTimeout(initializeFrankieAI, 2000);
});

// Also check periodically for new chat elements (Instagram loads dynamically)
setInterval(injectDeployButtons, 5000);

// Initialize immediately for cases when DOMContentLoaded has already fired
initializeFrankieAI();
