
// Content script for the Frankie AI extension
console.log('Frankie AI content script loaded');

// Import the conversation bot service
let ConversationInstance;

// State
let activeAgents = new Map();
let chatObservers = new Map();
let sidebar = null;
let conversationInstances = new Map();

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

// Deploy AI agent using the new conversation service
function deployAgent(config) {
  console.log('Deploying agent with config:', config);
  
  const chatId = config.chatData.chatId;
  const chatInput = document.getElementById(chatId);
  
  if (!chatInput) {
    console.error('Chat input not found for deployment');
    return;
  }
  
  // Create conversation instance
  const instanceId = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Import and use the conversation service
  import(chrome.runtime.getURL('chatBotService.js')).then(module => {
    const ConversationInstance = module.ConversationInstance;
    const instance = new ConversationInstance(chatInput, instanceId);
    
    // Store the instance
    conversationInstances.set(instanceId, instance);
    
    // Start the conversation
    instance.startConversation(config);
    
    console.log(`Agent ${instanceId} deployed successfully`);
  }).catch(error => {
    console.error('Failed to load conversation service:', error);
  });
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
