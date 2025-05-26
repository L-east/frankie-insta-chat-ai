
console.log('Frankie AI content script loaded');

let sidebarIframe = null;
let currentChatData = null;
let activeBotConfig = null;
let conversationInstance = null;
let isProcessing = false;
let deployButton = null;

// Load the chatbot service
const chatBotScript = document.createElement('script');
chatBotScript.src = chrome.runtime.getURL('chatBotService.js');
chatBotScript.onload = () => {
  console.log('ChatBot service loaded successfully');
  if (window.ConversationInstance) {
    conversationInstance = window.ConversationInstance;
  }
};
document.head.appendChild(chatBotScript);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openSidebar') {
    toggleSidebar();
    sendResponse({ success: true });
  }
});

function createSidebar() {
  if (sidebarIframe) return;
  
  // Create iframe for the sidebar
  sidebarIframe = document.createElement('iframe');
  sidebarIframe.src = chrome.runtime.getURL('index.html');
  sidebarIframe.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    width: 400px !important;
    height: 100vh !important;
    border: none !important;
    z-index: 999999 !important;
    background: white !important;
    box-shadow: -2px 0 10px rgba(0,0,0,0.1) !important;
    transform: translateX(100%) !important;
    transition: transform 0.3s ease !important;
  `;
  
  // Append to body
  document.body.appendChild(sidebarIframe);
  
  // Wait for iframe to load then show it
  sidebarIframe.onload = () => {
    setTimeout(() => {
      sidebarIframe.style.transform = 'translateX(0)';
    }, 100);
    
    // Set up message communication
    setupMessageCommunication();
  };
}

function toggleSidebar() {
  if (!sidebarIframe) {
    createSidebar();
  } else {
    // Toggle sidebar visibility
    const isVisible = sidebarIframe.style.transform === 'translateX(0px)' || sidebarIframe.style.transform === 'translateX(0)';
    sidebarIframe.style.transform = isVisible ? 'translateX(100%)' : 'translateX(0)';
  }
}

function setupMessageCommunication() {
  window.addEventListener('message', async (event) => {
    if (event.source !== sidebarIframe.contentWindow) return;
    
    console.log('Content script received message:', event.data);
    
    if (event.data.action === 'deployAgent') {
      await handleAgentDeployment(event.data.config);
    } else if (event.data.action === 'appReady') {
      console.log('App is ready in iframe');
    }
  });
}

function extractChatData() {
  try {
    // Get chat participant name
    const participantElement = document.querySelector('[data-testid="thread-header-title"] span, .x1lliihq.x1plvlek.xryxfnj.x1n2onr6.x193iq5w.xeuugli.x1fj9vlw.x13faqbe.x1vvkbs.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x1i0vuye.xvs91rp.xo1l8bm.x5n08af.x2b8uid.xw06pyt.x10wh9bi.x1wdrske.x8viiok.x18hxmgj');
    const participantName = participantElement ? participantElement.textContent.trim() : 'Unknown User';
    
    // Get recent messages
    const messageElements = document.querySelectorAll('[data-testid="message-container"], .x1n2onr6.xh8yej3 .x193iq5w');
    const messages = Array.from(messageElements).slice(-5).map((el, index) => {
      const textElement = el.querySelector('.x1lliihq, .xdj266r');
      return {
        id: `msg-${Date.now()}-${index}`,
        sender: el.closest('[data-testid="message-container"]')?.getAttribute('data-testid')?.includes('outgoing') ? 'You' : participantName,
        content: textElement ? textElement.textContent.trim() : '',
        timestamp: new Date().toISOString()
      };
    }).filter(msg => msg.content);
    
    return {
      chatId: `instagram-chat-${Date.now()}`,
      participantName,
      messages,
      platform: 'instagram'
    };
  } catch (error) {
    console.error('Error extracting chat data:', error);
    return {
      chatId: `instagram-chat-${Date.now()}`,
      participantName: 'Unknown User',
      messages: [],
      platform: 'instagram'
    };
  }
}

async function handleAgentDeployment(config) {
  console.log('Deploying agent with config:', config);
  
  try {
    activeBotConfig = config;
    currentChatData = extractChatData();
    
    // Update button to "Stop Frankie"
    updateDeployButton('stop');
    
    // Initialize conversation if needed
    if (conversationInstance && !conversationInstance.isActive()) {
      await conversationInstance.initialize({
        persona: config.persona,
        customInstructions: config.custom_prompt || '',
        chatData: currentChatData
      });
    }
    
    console.log('Agent deployed successfully');
    showNotification(`${config.persona.name} is now active in this chat!`);
    
  } catch (error) {
    console.error('Error deploying agent:', error);
    showNotification('Failed to deploy agent', 'error');
  }
}

function updateDeployButton(state) {
  const existingButton = document.querySelector('.frankie-deploy-btn');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Find the message input area
  const messageContainer = document.querySelector('[data-testid="message-input-container"], .xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.x1iyjqo2.x1gh3ibb.xisnujt.xeuugli.x1odjw0f.notranslate');
  
  if (messageContainer) {
    const button = document.createElement('button');
    button.className = 'frankie-deploy-btn';
    
    if (state === 'stop') {
      button.textContent = 'Stop Frankie';
      button.style.cssText = `
        background: #dc2626 !important;
        color: white !important;
        border: none !important;
        padding: 8px 16px !important;
        border-radius: 20px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        margin-left: 8px !important;
        z-index: 999 !important;
        position: relative !important;
      `;
      
      button.onclick = () => {
        stopAgent();
      };
    } else {
      button.textContent = 'Deploy Frankie';
      button.style.cssText = `
        background: #7c3aed !important;
        color: white !important;
        border: none !important;
        padding: 8px 16px !important;
        border-radius: 20px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        margin-left: 8px !important;
        z-index: 999 !important;
        position: relative !important;
      `;
      
      button.onclick = () => {
        openDeployConfig();
      };
    }
    
    // Insert button next to message input
    const messageInput = messageContainer.querySelector('textarea, [contenteditable="true"]');
    if (messageInput && messageInput.parentNode) {
      messageInput.parentNode.appendChild(button);
    } else {
      messageContainer.appendChild(button);
    }
    
    deployButton = button;
  }
}

function stopAgent() {
  activeBotConfig = null;
  
  if (conversationInstance) {
    conversationInstance.stop();
  }
  
  updateDeployButton('deploy');
  showNotification('Agent stopped');
  console.log('Agent stopped');
}

function openDeployConfig() {
  currentChatData = extractChatData();
  
  // Ensure sidebar is visible
  if (!sidebarIframe) {
    createSidebar();
  } else {
    sidebarIframe.style.transform = 'translateX(0)';
  }
  
  // Wait for iframe to be ready then send message
  setTimeout(() => {
    if (sidebarIframe && sidebarIframe.contentWindow) {
      sidebarIframe.contentWindow.postMessage({
        action: 'openAgentConfig',
        chatData: currentChatData
      }, '*');
    }
  }, 500);
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: ${type === 'error' ? '#dc2626' : '#059669'} !important;
    color: white !important;
    padding: 12px 20px !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    z-index: 999999 !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Initialize deploy button when page loads
setTimeout(() => {
  updateDeployButton('deploy');
}, 2000);

// Monitor for new messages and update deploy button
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      // Check if we're still on a chat page
      const messageContainer = document.querySelector('[data-testid="message-input-container"], .xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.x1iyjqo2.x1gh3ibb.xisnujt.xeuugli.x1odjw0f.notranslate');
      if (messageContainer && !document.querySelector('.frankie-deploy-btn')) {
        updateDeployButton(activeBotConfig ? 'stop' : 'deploy');
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('Frankie AI content script setup complete');
