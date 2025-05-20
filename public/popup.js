
// Popup script for Frankie AI extension

document.addEventListener('DOMContentLoaded', function() {
  // Check if the current page is Instagram
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url || '';
    const isInstagram = currentUrl.includes('instagram.com');
    const isInstagramMessages = 
      currentUrl.includes('instagram.com/direct/') || 
      currentUrl.includes('instagram.com/messages/');
    
    // Show appropriate UI section based on the current page
    document.getElementById('not-instagram').style.display = isInstagram ? 'none' : 'block';
    document.getElementById('instagram-found').style.display = isInstagram ? 'block' : 'none';
    
    // Setup button handlers
    document.getElementById('open-instagram').addEventListener('click', function() {
      chrome.tabs.create({ url: 'https://www.instagram.com/direct/inbox/' });
    });
    
    document.getElementById('open-dashboard').addEventListener('click', function() {
      // Send message to the content script to open the dashboard
      chrome.tabs.sendMessage(tabs[0].id, { action: 'openDashboard' });
      window.close(); // Close the popup
    });
    
    // If on Instagram messages page, get active agents
    if (isInstagramMessages) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getActiveAgents' }, function(response) {
        if (response && response.agents && response.agents.length > 0) {
          // Show active agents section
          document.getElementById('active-agents').style.display = 'block';
          
          // Populate agents list
          const agentsList = document.getElementById('agents-list');
          agentsList.innerHTML = ''; // Clear existing content
          
          response.agents.forEach(function(agent) {
            const agentElement = document.createElement('div');
            agentElement.className = 'agent';
            agentElement.innerHTML = `
              <div class="agent-header">
                <span class="agent-name">${agent.persona.name}</span>
                <span class="agent-badge">${agent.status}</span>
              </div>
              <div class="agent-info">
                <div>Mode: ${agent.config.mode === 'auto' ? 'Automated' : 'Manual'}</div>
                <div>Messages sent: ${agent.messagesSent}</div>
              </div>
              <button class="button" style="margin-top: 8px; font-size: 12px;" data-agent-id="${agent.id}">Stop Agent</button>
            `;
            
            agentsList.appendChild(agentElement);
            
            // Add event listener to stop button
            agentElement.querySelector('button').addEventListener('click', function() {
              const agentId = this.getAttribute('data-agent-id');
              chrome.tabs.sendMessage(tabs[0].id, { 
                action: 'stopAgent', 
                agentId: agentId 
              });
              
              // Remove the agent from the list
              agentElement.remove();
              
              // If no more agents, hide the section
              if (agentsList.children.length === 0) {
                document.getElementById('active-agents').style.display = 'none';
              }
            });
          });
        }
      });
    }
  });
});
