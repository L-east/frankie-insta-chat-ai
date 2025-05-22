
document.addEventListener('DOMContentLoaded', function() {
  // Get the dashboard button
  const dashboardBtn = document.getElementById('dashboardBtn');
  
  // Always set text to "Open Frankie" for consistency
  if (dashboardBtn) {
    dashboardBtn.textContent = 'Open Frankie';
    
    // Add click listener
    dashboardBtn.addEventListener('click', function() {
      // Send message to background script
      chrome.runtime.sendMessage({ action: 'openDashboard' }, function(response) {
        console.log('Response from background:', response);
        
        // Close popup after sending message
        window.close();
      });
    });
  }
  
  // Add event listeners for other buttons if needed
});
