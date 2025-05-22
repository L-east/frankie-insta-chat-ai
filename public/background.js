// Background script for the Frankie AI extension

// Listen for installation event
chrome.runtime.onInstalled.addListener(function(details) {
  console.log('Frankie AI Extension installed');
  
  // Initialize default settings
  chrome.storage.local.set({
    isEnabled: true,
    userSettings: {
      defaultPersona: 'icebreaker',
      defaultMode: 'auto',
      defaultScope: 'current'
    }
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received in background:', request);
  
  if (request.action === 'checkAuth') {
    // Check if user is authenticated
    chrome.storage.local.get(['authToken', 'user'], function(result) {
      sendResponse({
        isAuthenticated: !!result.authToken,
        user: result.user || null
      });
    });
    return true; // Required for async sendResponse
  }
  
  if (request.action === 'login') {
    // Store authentication data
    chrome.storage.local.set({
      authToken: request.data.token,
      user: request.data.user
    }, function() {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
  
  if (request.action === 'logout') {
    // Clear authentication data
    chrome.storage.local.remove(['authToken', 'user'], function() {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
  
  if (request.action === 'deployAgent') {
    // Forward deployment request to the active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'deployAgent',
          config: request.config
        });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Required for async sendResponse
  }
});

// Monitor tab updates to inject content script when needed
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('instagram.com')) {
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: function() {
        // Check if our script is already injected
        if (!window.frankieAIInjected) {
          window.frankieAIInjected = true;
          console.log('Frankie AI content script executed');
          
          // Notify that we're ready
          chrome.runtime.sendMessage({ action: 'contentScriptReady', url: window.location.href });
        }
      }
    });
  }
});

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Check if we're on Instagram
  if (tab.url.includes('instagram.com')) {
    // Send message to content script to open sidebar
    chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' });
  } else {
    // If not on Instagram, open Instagram in a new tab
    chrome.tabs.create({ url: 'https://www.instagram.com/direct/inbox/' });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openDashboard') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      
      // If we're on Instagram, open the sidebar
      if (activeTab.url.includes('instagram.com')) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'openSidebar' });
      } else {
        // If not on Instagram, open Instagram in a new tab
        chrome.tabs.create({ url: 'https://www.instagram.com/direct/inbox/' });
      }
    });
  }
});
