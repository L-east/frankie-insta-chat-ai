
document.addEventListener('DOMContentLoaded', function() {
  const openSidebarBtn = document.getElementById('openSidebar');
  
  openSidebarBtn.addEventListener('click', async function() {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab && tab.url && tab.url.includes('instagram.com')) {
      // Send message to content script to open sidebar
      chrome.tabs.sendMessage(tab.id, { action: 'openSidebar' });
      window.close(); // Close popup
    } else {
      // If not on Instagram, navigate there first
      chrome.tabs.create({ url: 'https://www.instagram.com' });
      window.close();
    }
  });
});
