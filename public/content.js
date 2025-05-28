// Content script for the Frankie AI extension
console.log('Frankie AI content script loaded');

window.PersistentChatBot = window.PersistentChatBot || {
  instances: new Map(),
  globalObserver: null,
  initialized: false
};

// Import conversation service
//let conversationInstances = new Map();

// Global variable for sidebar
let sidebar = null;

// Global variable to track script loading state
let chatBotServiceLoaded = false;
let chatBotServiceLoadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

// ConversationInstance class definition
class ConversationInstance {
  constructor(targetInput, instanceId) {
    this.instanceId = instanceId;
    this.state = {
      active: false,
      primeDirective: '',
      targetInput: targetInput,
      messageHistory: [],
      lastMessageCount: 0,
      isProcessing: false,
      lastPageSnapshot: '',
      monitorInterval: null,
      retryCount: 0,
      maxRetries: 3,
      startTime: 0,
      messagesSent: 0,
      timeLimit: 60, // Default time limit in seconds
      messageCount: 1, // Default message count
      pendingMessages: 0
    };
  }

  logDebug(stage, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.instanceId}] [${stage}] ${message}`);
    if (data) console.log(`[${timestamp}] [${this.instanceId}] [${stage}] Data:`, data);
  }

  updatePendingMessages() {
    if (!this.state.active) return;
    
    const pendingMessages = this.state.messageCount - this.state.messagesSent;
    this.state.pendingMessages = Math.max(0, pendingMessages);
    
    // Update button text
    const button = this.state.targetInput.parentElement.querySelector('.deploy-button');
    if (button) {
      if (this.state.pendingMessages > 0) {
        button.textContent = `Stop Frankie (${this.state.pendingMessages} messages pending)`;
      } else {
        // If no messages pending, stop the conversation
        this.stopConversation();
        button.textContent = 'Deploy Frankie';
        button.style.backgroundColor = '#9747FF';
        button.onmouseover = function() {
          this.style.backgroundColor = '#8035E0';
        }
        button.onmouseout = function() {
          this.style.backgroundColor = '#9747FF';
        }
        
        // Update click handler back to deploy
        button.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDeployClick(this.state.targetInput, button);
        };
      }
    }
  }

  async startConversation(config) {
    this.state.active = true;
    this.state.primeDirective = config.custom_prompt || config.persona.description || '';
    this.state.messageHistory = [];
    this.state.lastMessageCount = 0;
    this.state.isProcessing = false;
    this.state.retryCount = 0;
    this.state.startTime = Date.now();
    this.state.messagesSent = 0;
    this.state.timeLimit = config.time_limit || 60;
    this.state.messageCount = config.message_count || 1;
    this.state.pendingMessages = this.state.messageCount;

    this.logDebug('START', 'Conversation started', config);
    
    // Update button to stop state
    const button = this.state.targetInput.parentElement.querySelector('.deploy-button');
    if (button) {
      button.textContent = 'Stop Frankie';
      button.style.backgroundColor = '#f44336';
      button.onmouseover = function() {
        this.style.backgroundColor = '#d32f2f';
      }
      button.onmouseout = function() {
        this.style.backgroundColor = '#f44336';
      }
      
      // Update click handler to stop conversation
      button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopConversation(this.state.targetInput.id, button);
      };
    }
    
    this.updatePendingMessages();
    
    if (config.mode === 'auto') {
      await this.sendFirstMessage();
    }
  }

  formatMessageForAPI(message) {
    return {
      parts: [{ text: message }],
      role: message.sender === 'participant' ? 'user' : 'model'
    };
  }

  async sendFirstMessage() {
    if (this.state.isProcessing || !this.state.active) return;
    this.state.isProcessing = true;

    try {
      const chatMessages = this.extractChatMessages();
      const participantMessages = chatMessages
        .filter(m => m.sender === 'participant')
        .map(m => m.content)
        .join('\n');

      // Format message history for API
      const formattedHistory = chatMessages.map(msg => ({
        parts: [{ text: msg.content }],
        role: msg.sender === 'participant' ? 'user' : 'model'
      }));

      const apiPayload = {
        text: participantMessages,
        prime_directive: this.state.primeDirective,
        message_history: formattedHistory,
        full_chat_history: formattedHistory
      };

      this.logDebug('API', 'Sending request to API', {
        payload: JSON.stringify(apiPayload, null, 2)
      });

      const response = await fetch('http://localhost:5000/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();
      this.logDebug('API', 'Received response from API', data);
      
      const messageText = data.processed_text || '';
      
      if (!messageText) {
        this.logDebug('ERROR', 'Empty response from API');
        return;
      }
      
      if (this.state.active) {
        this.logDebug('PROCESS', 'Processing message text', messageText);
        this.state.messageHistory.push({ 
          parts: [{ text: messageText }],
          role: 'model'
        });
        
        const success = await this.typeAndSendMessage(messageText);
        if (success !== false) {
          this.state.messagesSent++;
          this.updatePendingMessages();
          this.updateConversationState();
          this.startReplyMonitoring();
          this.state.retryCount = 0;
        } else {
          this.logDebug('ERROR', 'Failed to send first message');
        }
      }
    } catch (err) {
      this.logDebug('ERROR', 'First message failed', err);
      await this.handleError();
    } finally {
      this.state.isProcessing = false;
    }
  }

  async typeAndSendMessage(text) {
    if (!this.state.active || !this.isInputStillValid()) return false;

    try {
      const targetInput = this.state.targetInput;
      
      // Clear input using platform-appropriate method
      if (targetInput.contentEditable === 'true') {
        targetInput.innerHTML = '';
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        targetInput.value = '';
        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      await new Promise(r => setTimeout(r, 100));
      
      this.logDebug('SEND', 'Starting to type and send message', {
        textLength: text.length,
        textPreview: text,
        inputType: targetInput.tagName,
        contentEditable: targetInput.contentEditable
      });
      
      targetInput.focus();
      
      const isContentEditable = targetInput.contentEditable === 'true';
      
      if (isContentEditable) {
        await this.typeIntoContentEditable(targetInput, text);
      } else {
        await this.typeIntoTextarea(targetInput, text);
      }
      
      const sent = await this.attemptSend(targetInput);
      
      if (sent) {
        this.logDebug('SEND', 'Message sent successfully');
        await new Promise(resolve => setTimeout(resolve, 1500));
        return true;
      } else {
        this.logDebug('ERROR', 'Failed to send message');
        return false;
      }
      
    } catch (err) {
      this.logDebug('ERROR', 'Failed to send message', err);
      return false;
    }
  }

  isInputStillValid() {
    try {
      if (!this.state.targetInput) return false;
      
      if (!document.contains(this.state.targetInput)) return false;
      
      if (!this.state.targetInput.isConnected) return false;
      
      const rect = this.state.targetInput.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
      
      if (this.state.targetInput.contentEditable !== 'true' && 
          this.state.targetInput.tagName !== 'TEXTAREA' && 
          this.state.targetInput.tagName !== 'INPUT') return false;
      
      return true;
    } catch (e) {
      this.logDebug('VALID', 'Validity check failed', e);
      return false;
    }
  }

  extractChatMessages() {
    try {
      if (!this.state.targetInput) return [];
      
      const possibleContainers = [
        this.state.targetInput.closest('[role="dialog"]'),
        this.state.targetInput.closest('main'),
        this.state.targetInput.closest('div[role="main"]'),
        this.state.targetInput.closest('[data-testid*="conversation"]'),
        this.state.targetInput.closest('[class*="chat"]'),
        document.querySelector('[role="main"]'),
        document.body
      ];
      
      let chatContainer = null;
      for (const container of possibleContainers) {
        if (container && container.querySelectorAll('[role="row"]').length > 0) {
          chatContainer = container;
          break;
        }
      }
      
      if (!chatContainer) {
        this.logDebug('EXTRACT', 'No suitable chat container found');
        return [];
      }
      
      const messageElements = Array.from(chatContainer.querySelectorAll('[role="row"]'));
      const messages = [];
      
      for (const element of messageElements) {
        try {
          const isMyMessage = !!(
            element.querySelector('[style*="margin-left: auto"]') ||
            element.querySelector('[data-testid="outgoing-message"]') ||
            element.querySelector('[data-testid*="user-message"]') ||
            element.closest('[data-testid*="user"]') ||
            (element.querySelector('div')?.style?.marginLeft === 'auto')
          );
          
          const contentSelectors = [
            'div[dir="auto"]',
            '[data-testid="message-text"]',
            '[data-testid*="message"]',
            '.message-content',
            '[role="paragraph"]',
            'p',
            'div:not([role]):not([class*="meta"]):not([class*="time"])'
          ];
          
          let content = '';
          for (const selector of contentSelectors) {
            const contentEl = element.querySelector(selector);
            if (contentEl?.textContent) {
              content = contentEl.textContent;
              break;
            }
          }
          
          if (!content) {
            content = element.textContent || '';
            const uiPatterns = [
              /^\d+:\d+$/,
              /^(online|offline|typing)$/i,
              /^(read|delivered|sent)$/i
            ];
            
            for (const pattern of uiPatterns) {
              if (pattern.test(content)) {
                content = '';
                break;
              }
            }
          }
          
          if (content && content.length > 0) {
            messages.push({
              sender: isMyMessage ? 'user' : 'participant',
              content: content,
              timestamp: new Date().toISOString()
            });
          }
        } catch (e) {
          this.logDebug('EXTRACT', 'Error processing message element', e);
        }
      }
      
      this.logDebug('EXTRACT', 'Extracted messages', messages);
      return messages;
    } catch (e) {
      this.logDebug('EXTRACT', 'Error extracting messages', e);
      return [];
    }
  }

  async typeIntoContentEditable(element, text) {
    return new Promise(async (resolve) => {
      try {
        this.logDebug('TYPE', 'Starting to type text', { 
          textLength: text.length, 
          textPreview: text,
          elementType: element.tagName,
          isContentEditable: element.contentEditable
        });

        // Clear existing content thoroughly
        const range = document.createRange();
        range.selectNodeContents(element);
        range.deleteContents();
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Focus the element
        element.focus();

        // Char-by-char typing with execCommand
        try {
          element.innerHTML = '';
          element.focus();
          
          for (let i = 0; i < text.length; i++) {
            if (!this.state.active) break;
            document.execCommand('insertText', false, text[i]);
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          
          const currentText = element.textContent || element.innerText || '';
          this.logDebug('TYPE', 'Char-by-char typing completed', {
            expectedLength: text.length,
            actualLength: currentText.length,
            matches: currentText === text
          });
          
          resolve();
          return;
        } catch (e) {
          this.logDebug('TYPE', 'Char-by-char typing failed', e);
        }

        // Fallback to direct text insertion
        try {
          element.textContent = text;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          element.dispatchEvent(new Event('keyup', { bubbles: true }));
          
          const currentText = element.textContent || element.innerText || '';
          if (currentText === text) {
            this.logDebug('TYPE', 'Successfully typed using textContent');
            resolve();
            return;
          }
        } catch (e) {
          this.logDebug('TYPE', 'textContent method failed', e);
        }

        resolve();
      } catch (e) {
        this.logDebug('TYPE', 'All typing methods failed', e);
        resolve();
      }
    });
  }

  async typeIntoTextarea(textarea, text) {
    return new Promise(async (resolve) => {
      try {
        this.logDebug('TYPE', 'Starting textarea typing', { 
          textLength: text.length, 
          textPreview: text,
          elementType: textarea.tagName,
          elementValue: textarea.value
        });

        // Clear and focus with fresh state
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 50));
        textarea.focus();

        // Character-by-character typing
        for (let i = 0; i < text.length; i++) {
          if (!this.state.active) break;
          
          textarea.value += text[i];
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(r => setTimeout(r, 50));
        }

        // Final events to ensure UI updates
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 100));

        this.logDebug('TYPE', 'Textarea typing completed', {
          expectedLength: text.length,
          actualLength: textarea.value.length,
          matches: textarea.value === text
        });
        
        resolve();
      } catch (e) {
        this.logDebug('TYPE', 'Textarea typing failed', e);
        resolve();
      }
    });
  }

  async attemptSend(targetInput) {
    // Method 1: Find and click send button
    const sendButton = this.findSendButton(targetInput);
    if (sendButton) {
      try {
        sendButton.click();
        this.logDebug('SEND', 'Clicked send button');
        return true;
      } catch (e) {
        this.logDebug('SEND', 'Send button click failed', e);
      }
    }

    // Method 2: Keyboard events (Enter key)
    try {
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      
      targetInput.dispatchEvent(enterEvent);
      this.logDebug('SEND', 'Dispatched Enter key');
      
      // Also try keyup
      const enterUpEvent = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true
      });
      targetInput.dispatchEvent(enterUpEvent);
      return true;
    } catch (e) {
      this.logDebug('SEND', 'Enter key dispatch failed', e);
    }

    // Method 3: Submit form if exists
    try {
      const form = targetInput.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        this.logDebug('SEND', 'Submitted form');
        return true;
      }
    } catch (e) {
      this.logDebug('SEND', 'Form submit failed', e);
    }

    return false;
  }

  findSendButton(input) {
    const container = input.closest('form, div, section, article') || input.parentElement;
    
    const selectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button[aria-label*="Send" i]',
      'button[aria-label*="Post" i]',
      'button[data-testid*="send" i]',
      'button[data-testid*="post" i]',
      'svg[aria-label*="Send" i]',
      'button:has(svg[aria-label*="Send" i])',
      '[role="button"][aria-label*="Send" i]',
      'button[title*="Send" i]',
      'button[title*="Post" i]'
    ];

    for (const selector of selectors) {
      try {
        const element = container?.querySelector(selector);
        if (element) {
          // If it's an SVG, find the parent button
          const button = element.tagName === 'SVG' ? 
            element.closest('button') || element.parentElement :
            element;
          
          if (button && (button.tagName === 'BUTTON' || button.role === 'button')) {
            this.logDebug('SEND', `Found send button with selector: ${selector}`);
            return button;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    // Fallback: look for buttons near the input
    try {
      const nearbyButtons = Array.from(container?.querySelectorAll('button') || []);
      for (const button of nearbyButtons) {
        const text = button.textContent?.toLowerCase() || '';
        const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
        const title = button.getAttribute('title')?.toLowerCase() || '';
        
        if (text.includes('send') || text.includes('post') || 
            ariaLabel.includes('send') || ariaLabel.includes('post') ||
            title.includes('send') || title.includes('post')) {
          this.logDebug('SEND', 'Found send button by text content');
          return button;
        }
      }
    } catch (e) {
      // Ignore errors in fallback
    }

    return null;
  }

  updateConversationState() {
    this.state.lastMessageCount = this.extractChatMessages().length;
    this.state.lastPageSnapshot = document.body.innerHTML;
  }

  startReplyMonitoring() {
    if (this.state.monitorInterval) {
      clearInterval(this.state.monitorInterval);
    }

    this.state.monitorInterval = setInterval(async () => {
      if (!this.state.active || this.state.isProcessing) return;

      try {
        // Check if we should stop based on time or message count
        if (this.shouldStopConversation()) {
          this.logDebug('MONITOR', 'Stopping conversation due to limits', {
            messagesSent: this.state.messagesSent,
            messageCount: this.state.messageCount,
            timeElapsed: (Date.now() - this.state.startTime) / 1000,
            timeLimit: this.state.timeLimit*60
          });
          this.stopConversation();
          return;
        }

        const currentMessages = this.extractChatMessages();
        if (currentMessages.length > this.state.lastMessageCount) {
          const newMessages = currentMessages.slice(this.state.lastMessageCount);
          const participantMessages = newMessages.filter(m => m.sender === 'participant');

          if (participantMessages.length > 0) {
            this.state.isProcessing = true;
            await this.processAndSendReply(participantMessages);
            this.state.isProcessing = false;
          }

          this.updateConversationState();
        }
      } catch (e) {
        this.logDebug('MONITOR', 'Error in reply monitoring', e);
      }
    }, 2000);
  }

  shouldStopConversation() {
    if (!this.state.active) return true;
    
    // Check message count limit
    if (this.state.messageCount > 0 && this.state.messagesSent >= this.state.messageCount) {
      this.logDebug('LIMIT', 'Message count limit reached', {
        messagesSent: this.state.messagesSent,
        messageCount: this.state.messageCount
      });
      return true;
    }
    
    // Check time limit (convert to milliseconds)
    const timeElapsed = (Date.now() - this.state.startTime) / 1000;
    if (this.state.timeLimit > 0 && timeElapsed >= this.state.timeLimit * 60) {
      this.logDebug('LIMIT', 'Time limit reached', {
        timeElapsed: timeElapsed,
        timeLimit: this.state.timeLimit * 60
      });
      return true;
    }
    
    return false;
  }

  async processAndSendReply(messages) {    
    try {
      const allChatMessages = this.extractChatMessages();
      const messageText = messages.map(m => m.content).join('\n');
      const participantMessages = allChatMessages
        .filter(m => m.sender === 'participant')
        .map(m => m.content)
        .join('\n');

      // Format message history for API
      const formattedHistory = allChatMessages.map(msg => ({
        parts: [{ text: msg.content }],
        role: msg.sender === 'participant' ? 'user' : 'model'
      }));

      // Add current message to history
      formattedHistory.push({ 
        parts: [{ text: messageText }],
        role: 'user'
      });
      
      const apiPayload = {
        text: participantMessages,
        prime_directive: this.state.primeDirective,
        message_history: formattedHistory,
        full_chat_history: formattedHistory
      };

      this.logDebug('API', 'Processing reply', {
        payload: JSON.stringify(apiPayload, null, 2)
      });
      
      const response = await fetch('http://localhost:5000/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();
      this.logDebug('API', 'Received reply response', data);
      
      const replyText = data.processed_text || '';
      
      if (!replyText) {
        this.logDebug('ERROR', 'Empty response from API');
        return;
      }

      if (this.state.active) {
        this.logDebug('PROCESS', 'Processing reply message', replyText);
        this.state.messageHistory.push({ 
          parts: [{ text: messageText }],
          role: 'user'
        });
        this.state.messageHistory.push({ 
          parts: [{ text: replyText }],
          role: 'model'
        });
        
        const success = await this.typeAndSendMessage(replyText);
        if (success) {
          this.state.messagesSent++;
          this.updatePendingMessages();
          this.state.retryCount = 0;
        }
      }
    } catch (e) {
      this.logDebug('REPLY', 'Error processing reply', e);
      await this.handleError();
    }
  }

  async handleError() {
    this.state.retryCount++;
    if (this.state.retryCount >= this.state.maxRetries) {
      this.stopConversation();
    } else {
      await new Promise(r => setTimeout(r, 2000));
      if (this.state.active) {
        await this.sendFirstMessage();
      }
    }
  }

  stopConversation() {
    this.state.active = false;
    
    if (this.state.monitorInterval) {
      clearInterval(this.state.monitorInterval);
      this.state.monitorInterval = null;
    }

    // Reset button state
    const button = this.state.targetInput.parentElement.querySelector('.deploy-button');
    if (button) {
      button.textContent = 'Deploy Frankie';
      button.style.backgroundColor = '#9747FF';
      button.onmouseover = function() {
        this.style.backgroundColor = '#8035E0';
      }
      button.onmouseout = function() {
        this.style.backgroundColor = '#9747FF';
      }
      
      // Update click handler back to deploy
      button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDeployClick(this.state.targetInput, button);
      };
    }

    this.logDebug('STOP', 'Conversation stopped');
  }
}

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

// Load chatBotService.js dynamically
async function loadChatBotService() {
  return new Promise((resolve, reject) => {
    if (window.ConversationInstance) {
      console.log('ConversationInstance already available');
      chatBotServiceLoaded = true;
      resolve();
      return;
    }

    if (chatBotServiceLoadAttempts >= MAX_LOAD_ATTEMPTS) {
      reject(new Error('Maximum load attempts reached for chatBotService.js'));
      return;
    }

    chatBotServiceLoadAttempts++;

    // Remove any existing script to prevent duplicates
    const existingScript = document.querySelector('script[src*="chatBotService.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('chatBotService.js');
    script.type = 'text/javascript';
    
    // Add error handling for script loading
    script.onerror = (error) => {
      console.error('Failed to load chatBotService.js:', error);
      chatBotServiceLoaded = false;
      reject(new Error('Failed to load chatBotService.js'));
    };

    // Add load event handler
    script.onload = () => {
      console.log('chatBotService.js loaded successfully');
      // Wait a bit to ensure the script is fully initialized
      setTimeout(() => {
      if (window.ConversationInstance) {
          console.log('ConversationInstance found after loading');
          chatBotServiceLoaded = true;
        resolve();
      } else {
          console.error('ConversationInstance not found after loading script');
          chatBotServiceLoaded = false;
        reject(new Error('ConversationInstance not found after loading script'));
      }
      }, 1000); // Increased timeout to ensure proper initialization
    };

    // Add the script to the document
    (document.head || document.documentElement).appendChild(script);
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
  
  chatEditors.forEach((chat, index) => {
    // Generate a unique ID for this chat editor if it doesn't have one
    if (!chat.id) {
      chat.id = `chat-editor-${Date.now()}-${index}`;
    }
    
    if (!chat.parentElement.querySelector('.deploy-wrapper-chat')) {
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
      } else {
        chat.parentElement.appendChild(wrapper);
      }

      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDeployClick(chat, button);
      });
    }
  });
}

// Handle deploy button click
function handleDeployClick(chatInput, button) {
  const chatId = chatInput.id;
  
  // Extract messages from the chat window
  const messages = extractChatMessages(chatInput);
  
  // Find the chat participant's name
  const participantName = extractParticipantName();
  
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
    return headerElement ? headerElement.textContent : 'User';
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
async function deployAgent(config) {
  console.log('Deploying agent with config:', config);
  
  const chatId = config.chatData.chatId;
  const chatInput = document.getElementById(chatId);
  
  if (!chatInput) {
    console.error('Chat input not found for deployment');
    return;
  }
  
  // Create conversation instance
  const instanceId = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
    try {
    const instance = new ConversationInstance(chatInput, instanceId);
      
    // Store the instance in PersistentChatBot
    window.PersistentChatBot.instances.set(instanceId, instance);
      
      // Start the conversation
      instance.startConversation(config);
      
      console.log(`Agent ${instanceId} deployed successfully`);
      
      // Close the sidebar
      const sidebar = document.getElementById('frankie-sidebar');
      if (sidebar) {
        sidebar.style.transform = 'translateX(100%)';
      }
    } catch (error) {
    console.error('Failed to deploy agent:', error);
    // Show error to user
    const errorMessage = 'Failed to deploy agent. Please try again.';
    if (window.parent) {
      window.parent.postMessage({
        action: 'showError',
        message: errorMessage
      }, '*');
    }
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

// Stop conversation
function stopConversation(chatId, button) {
  // Find the instance for this chat
  for (const [instanceId, instance] of window.PersistentChatBot.instances.entries()) {
    if (instance.state.targetInput.id === chatId) {
      instance.stopConversation();
      window.PersistentChatBot.instances.delete(instanceId);
      
      // Reset button to deploy state
      button.textContent = 'Deploy Frankie';
      button.style.backgroundColor = '#9747FF';
      button.onmouseover = function() {
        this.style.backgroundColor = '#8035E0';
      }
      button.onmouseout = function() {
        this.style.backgroundColor = '#9747FF';
      }
      
      // Update click handler back to deploy
      button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDeployClick(instance.state.targetInput, button);
      };
      
      break;
    }
  }
}
