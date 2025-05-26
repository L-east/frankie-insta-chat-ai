// Content script for the Frankie AI extension
console.log('Frankie AI content script loaded');

// Import conversation service
let conversationInstances = new Map();

// Main function to initialize the extension
function initializeFrankieAI() {
  console.log('Initializing Frankie AI for Instagram');
  
  // Load the chatBotService
  loadChatBotService().then(() => {
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
  }).catch(error => {
    console.error('Failed to load conversation service:', error);
  });
}

// Load chatBotService.js dynamically
async function loadChatBotService() {
  return new Promise((resolve, reject) => {
    if (window.ConversationInstance) {
      console.log('ConversationInstance already available');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('chatBotService.js');
    script.onload = () => {
      console.log('chatBotService.js loaded successfully');
      if (window.ConversationInstance) {
        resolve();
      } else {
        reject(new Error('ConversationInstance not found after loading script'));
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load chatBotService.js:', error);
      reject(error);
    };
    document.head.appendChild(script);
  });
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
  
  return true;
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
    sidebar.style.width = '400px';
    sidebar.style.height = '100%';
    sidebar.style.backgroundColor = 'white';
    sidebar.style.boxShadow = '-2px 0 10px rgba(0, 0, 0, 0.1)';
    sidebar.style.zIndex = '9999';
    sidebar.style.transition = 'transform 0.3s ease';
    sidebar.style.transform = 'translateX(100%)';
    sidebar.style.border = '1px solid #e5e5e5';
    
    // Create iframe to load our React app
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.allow = 'clipboard-read; clipboard-write';
    
    // Get the correct extension URL
    const extensionURL = chrome.runtime.getURL('index.html');
    console.log('Loading extension URL in iframe:', extensionURL);
    
    // Set up iframe event handlers
    iframe.onload = function() {
      console.log('Iframe loaded successfully');
      
      // Wait for React app to initialize
      setTimeout(() => {
        console.log('Attempting to send message to iframe');
        try {
          if (iframe.contentWindow && chatData) {
            iframe.contentWindow.postMessage({
              action: 'openAgentConfig',
              chatData
            }, '*');
            console.log('Message sent to iframe successfully');
          }
        } catch (error) {
          console.error('Error sending message to iframe:', error);
        }
      }, 2000);
    };

    iframe.onerror = function(error) {
      console.error('Error loading iframe:', error);
    };
    
    // Set the source
    iframe.src = extensionURL;
    
    sidebar.appendChild(iframe);
    document.body.appendChild(sidebar);
  } else {
    console.log('Using existing sidebar');
    // Send chat data to the iframe if provided
    const iframe = sidebar.querySelector('iframe');
    if (iframe && iframe.contentWindow && chatData) {
      console.log('Sending chat data to existing iframe');
      try {
        iframe.contentWindow.postMessage({
          action: 'openAgentConfig',
          chatData
        }, '*');
      } catch (error) {
        console.error('Error sending message to existing iframe:', error);
      }
    }
  }
  
  // Show sidebar
  setTimeout(() => {
    sidebar.style.transform = 'translateX(0)';
    console.log('Sidebar animation started');
  }, 100);
  
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
  
  if (event.data && event.data.action === 'appReady') {
    console.log('React app is ready');
  }
});

// Deploy AI agent using the conversation service
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
  
  // Use the global ConversationInstance
  if (window.ConversationInstance) {
    try {
      const instance = new window.ConversationInstance(chatInput, instanceId);
      
      // Store the instance
      conversationInstances.set(instanceId, instance);
      
      // Start the conversation
      instance.startConversation(config);
      
      console.log(`Agent ${instanceId} deployed successfully`);
      
      // Close the sidebar
      const sidebar = document.getElementById('frankie-sidebar');
      if (sidebar) {
        sidebar.style.transform = 'translateX(100%)';
      }
    } catch (error) {
      console.error('Failed to create conversation instance:', error);
    }
  } else {
    console.error('ConversationInstance not available. Make sure chatBotService.js is loaded.');
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
