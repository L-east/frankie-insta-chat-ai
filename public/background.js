
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
    // Check if we're on a messages page
    if (tab.url.includes('/direct/') || tab.url.includes('/messages/')) {
      console.log('Instagram messages page detected, ensuring content script is loaded');
      
      // Execute content script if needed (improve detection mechanism)
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: function() {
          // Check if our script is already injected
          if (!window.frankieAIInjected) {
            window.frankieAIInjected = true;
            console.log('Frankie AI content script executed on messages page');
            
            // Notify that we're ready
            chrome.runtime.sendMessage({ action: 'contentScriptReady', url: window.location.href });
          }
        }
      });
    }
  }
});

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Always send message to open sidebar regardless of condition
  if (tab.url.includes('instagram.com')) {
    chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' }, function(response) {
      // Check for error in response
      if (chrome.runtime.lastError) {
        console.error('Error opening sidebar:', chrome.runtime.lastError);
        // If there was an error, try to inject the content script and try again
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }, function() {
          // Try again after script injection
          setTimeout(() => {
            chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' });
          }, 1000);
        });
      }
    });
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
      
      // Always try to open the sidebar regardless of where we are
      if (activeTab.url.includes('instagram.com')) {
        chrome.tabs.sendMessage(activeTab.id, { action: 'openSidebar' }, function(response) {
          // Check for error in response
          if (chrome.runtime.lastError) {
            console.error('Error opening sidebar from popup:', chrome.runtime.lastError);
            // If there was an error, try to inject the content script and try again
            chrome.scripting.executeScript({
              target: { tabId: activeTab.id },
              files: ['content.js']
            }, function() {
              // Try again after script injection
              setTimeout(() => {
                chrome.tabs.sendMessage(activeTab.id, { action: 'openSidebar' });
              }, 1000);
            });
          }
        });
      } else {
        // If not on Instagram, open Instagram in a new tab
        chrome.tabs.create({ url: 'https://www.instagram.com/direct/inbox/' });
      }
    });
    sendResponse({ success: true }); // Always respond with success
  }
  return true; // Required for async sendResponse
});
