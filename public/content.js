
console.log("Frankie AI content script loaded");

let isSidebarVisible = false;
let appIframe = null;

// Message listener for communication with popup and iframe
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.action === 'openSidebar') {
    console.log("Opening sidebar from popup");
    showSidebar();
    sendResponse({ success: true });
  }
  
  return true;
});

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
  console.log("Content script received window message:", event.data);
  
  if (event.data.action === 'closeSidebar') {
    hideSidebar();
  }
  
  if (event.data.action === 'appReady') {
    console.log("App is ready in iframe");
  }
  
  if (event.data.action === 'deployAgent') {
    console.log("Agent deployment request:", event.data.config);
    handleAgentDeployment(event.data.config);
  }
});

function showSidebar() {
  console.log("Showing sidebar");
  
  if (isSidebarVisible) {
    console.log("Sidebar already visible");
    return;
  }
  
  // Create iframe if it doesn't exist
  if (!appIframe) {
    appIframe = document.createElement('iframe');
    appIframe.id = 'frankie-sidebar';
    appIframe.src = chrome.runtime.getURL('index.html');
    appIframe.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      width: 400px !important;
      height: 100vh !important;
      border: none !important;
      z-index: 10000 !important;
      background: white !important;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1) !important;
    `;
    
    // Wait for iframe to load before adding to DOM
    appIframe.onload = () => {
      console.log("Iframe loaded successfully");
      setTimeout(() => {
        if (appIframe && appIframe.contentWindow) {
          appIframe.contentWindow.postMessage({ 
            action: 'sidebarOpened' 
          }, '*');
        }
      }, 500);
    };
    
    document.body.appendChild(appIframe);
  }
  
  isSidebarVisible = true;
  console.log("Sidebar iframe created and shown");
}

function hideSidebar() {
  console.log("Hiding sidebar");
  
  if (appIframe) {
    appIframe.remove();
    appIframe = null;
  }
  
  isSidebarVisible = false;
  console.log("Sidebar hidden and removed");
}

function handleAgentDeployment(config) {
  console.log("Handling agent deployment:", config);
  
  // Store deployment config for potential use
  localStorage.setItem('frankie_last_deployment', JSON.stringify({
    config: config,
    timestamp: Date.now()
  }));
  
  // Find and update deploy buttons
  updateDeployButtons(config);
}

function updateDeployButtons(config) {
  const deployButtons = document.querySelectorAll('.deploy-button');
  
  deployButtons.forEach(button => {
    if (config.persona) {
      button.textContent = `Stop ${config.persona.name}`;
      button.onclick = () => {
        console.log("Stopping agent");
        button.textContent = 'Deploy Frankie';
        button.onclick = () => openAgentConfig();
        
        // Clear stored deployment
        localStorage.removeItem('frankie_last_deployment');
      };
    }
  });
}

function openAgentConfig() {
  console.log("Opening agent config");
  
  // Get chat context
  const chatData = getChatContext();
  
  // Show sidebar and send config message
  showSidebar();
  
  setTimeout(() => {
    if (appIframe && appIframe.contentWindow) {
      appIframe.contentWindow.postMessage({
        action: 'openAgentConfig',
        chatData: chatData
      }, '*');
    }
  }, 1000);
}

function getChatContext() {
  // Try to extract chat information from Instagram's interface
  const chatHeader = document.querySelector('[data-testid="conversation-header"]');
  const username = chatHeader ? chatHeader.textContent.trim() : 'Unknown User';
  
  return {
    platform: 'instagram',
    chatId: `instagram_${Date.now()}`,
    username: username,
    timestamp: Date.now()
  };
}

function addDeployButtons() {
  // Add deploy buttons to Instagram message input areas
  const messageInputs = document.querySelectorAll('div[contenteditable="true"][aria-label*="Message"]');
  
  messageInputs.forEach(input => {
    const container = input.closest('div[role="textbox"]')?.parentElement;
    if (container && !container.querySelector('.deploy-wrapper-chat')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'deploy-wrapper-chat';
      
      const button = document.createElement('button');
      button.className = 'deploy-button';
      button.innerHTML = `
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.27 9 10.64 5.16-1.37 9-5.09 9-10.64V7l-10-5z"/>
        </svg>
        Deploy Frankie
      `;
      
      button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openAgentConfig();
      };
      
      wrapper.appendChild(button);
      container.appendChild(wrapper);
    }
  });
}

// Initialize and watch for changes
function initialize() {
  console.log("Initializing Frankie AI");
  
  // Add initial deploy buttons
  setTimeout(addDeployButtons, 2000);
  
  // Watch for DOM changes to add buttons to new message inputs
  const observer = new MutationObserver(() => {
    addDeployButtons();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

console.log("Frankie AI content script setup complete");
