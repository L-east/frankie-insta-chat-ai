
// Popup script for Frankie AI extension

document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status
  checkAuth();
  
  // Set up button listeners
  document.getElementById('login-button').addEventListener('click', function() {
    document.getElementById('login-form').style.display = 'block';
  });
  
  document.getElementById('signup-button').addEventListener('click', function() {
    // Open signup page in new tab
    chrome.tabs.create({ url: 'https://frankieai.com/signup' });
  });
  
  document.getElementById('submit-login').addEventListener('click', function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password) {
      login(email, password);
    }
  });
  
  document.getElementById('settings-button').addEventListener('click', function() {
    // Open settings page in new tab
    chrome.tabs.create({ url: 'https://frankieai.com/dashboard/settings' });
  });
  
  document.getElementById('logout-button').addEventListener('click', logout);
});

// Check authentication status
function checkAuth() {
  chrome.runtime.sendMessage({
    action: 'checkAuth'
  }, function(response) {
    if (response.isAuthenticated) {
      // User is logged in
      document.getElementById('logged-in').style.display = 'block';
      document.getElementById('not-logged-in').style.display = 'none';
      
      // Display user email
      document.getElementById('user-email').textContent = response.user?.email || 'User';
    } else {
      // User is not logged in
      document.getElementById('logged-in').style.display = 'none';
      document.getElementById('not-logged-in').style.display = 'block';
    }
  });
}

// Login function
function login(email, password) {
  // In a real extension, this would make an API call to your auth server
  
  // For demo purposes, simulate successful login
  chrome.runtime.sendMessage({
    action: 'login',
    data: {
      token: 'example-auth-token',
      user: {
        id: 'user-123',
        email: email,
        isPro: false,
        freeAgentsUsed: 2,
        freeAgentsTotal: 7,
        freeExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    }
  }, function(response) {
    if (response.success) {
      // Update UI
      checkAuth();
    }
  });
}

// Logout function
function logout() {
  chrome.runtime.sendMessage({
    action: 'logout'
  }, function(response) {
    if (response.success) {
      // Update UI
      checkAuth();
    }
  });
}
