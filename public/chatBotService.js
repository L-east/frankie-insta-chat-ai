// This file is for content script imports - it exports the conversation functionality
// The actual implementation is in the TypeScript service

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
      messagesSent: 0
    };
  }

  logDebug(stage, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.instanceId}] [${stage}] ${message}`);
    if (data) console.log(`[${timestamp}] [${this.instanceId}] [${stage}] Data:`, data);
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

    this.logDebug('START', 'Conversation started', config);
    
    if (config.mode === 'auto') {
      await this.sendFirstMessage();
    }
  }

  async sendFirstMessage() {
    if (this.state.isProcessing || !this.state.active) return;
    this.state.isProcessing = true;

    try {
      const chatMessages = this.extractChatMessages();
      
      // Format messages with roles
      const formattedMessages = chatMessages.map(m => ({
        role: m.sender === 'user' ? 'model' : 'user',
        content: m.content
      }));

      // Join messages with role information
      const completeChatText = formattedMessages
        .map(m => `${m.role === 'user' ? 'Participant' : 'AI'}: ${m.content}`)
        .join('\n');

      this.logDebug('API', 'Sending request to API', {
        completeChatText: completeChatText.substring(0, 100) + '...',
        primeDirective: this.state.primeDirective
      });

      const response = await fetch('http://localhost:5000/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: completeChatText,
          prime_directive: this.state.primeDirective
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();
      this.logDebug('API', 'Received response from API', data);
      
      const messageText = data.processed_text || '';
      
      if (messageText && this.state.active) {
        this.logDebug('PROCESS', 'Processing message text', messageText.substring(0, 100) + '...');
        this.state.messageHistory.push({ role: 'assistant', content: messageText });
        
        const success = await this.typeAndSendMessage(messageText);
        if (success !== false) {
          this.state.messagesSent++;
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
        textPreview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
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
            (element.querySelector('div')?.style?.marginLeft === 'auto') ||
            element.classList.contains('outgoing') ||
            element.getAttribute('data-message-type') === 'outgoing'
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
          
          if (content && content.length > 3) {
            messages.push({
              id: element.id || `msg_${Date.now()}_${Math.random()}`,
              sender: isMyMessage ? 'model' : 'participant',
              content: content,
              element: element,
              timestamp: Date.now()
            });
          }
        } catch (error) {
          this.logDebug('EXTRACT', 'Error processing individual message', error);
        }
      }
      
      this.logDebug('EXTRACT', `Extracted ${messages.length} messages`);
      return messages;
    } catch (error) {
      this.logDebug('EXTRACT', 'Error extracting messages', error);
      return [];
    }
  }

  getCurrentChatState() {
    const messages = this.extractChatMessages();
    return {
      messageCount: messages.filter(m => m.sender === 'participant').length,
      snapshot: messages.slice(-3).map(m => m.content).join('|')
    };
  }

  updateConversationState() {
    const currentState = this.getCurrentChatState();
    this.state.lastMessageCount = currentState.messageCount;
    this.state.lastPageSnapshot = currentState.snapshot;
  }

  startReplyMonitoring() {
    if (this.state.monitorInterval) {
      clearInterval(this.state.monitorInterval);
    }

    let checkCount = 0;
    const maxChecks = 600;
    let baselineState = this.getCurrentChatState();
    let lastKnownMessages = this.extractChatMessages();

    this.state.monitorInterval = window.setInterval(() => {
      if (!this.state.active) {
        if (this.state.monitorInterval) {
          clearInterval(this.state.monitorInterval);
          this.state.monitorInterval = null;
        }
        return;
      }

      if (this.shouldStopConversation()) {
        this.stopConversation();
        return;
      }

      if (checkCount++ > maxChecks) {
        this.logDebug('MONITOR', 'Max checks reached, restarting monitor');
        if (this.state.monitorInterval) {
          clearInterval(this.state.monitorInterval);
        }
        checkCount = 0;
        this.startReplyMonitoring();
        return;
      }

      this.refreshInputReference();

      if (!this.isInputStillValid()) {
        this.logDebug('MONITOR', 'Input invalid, attempting reconnection');
        if (this.attemptReconnection()) {
          baselineState = this.getCurrentChatState();
          lastKnownMessages = this.extractChatMessages();
        }
        return;
      }

      const currentMessages = this.extractChatMessages();
      const currentState = this.getCurrentChatState();
      
      const hasNewMessages = currentMessages.length > lastKnownMessages.length;
      const hasStateChange = currentState.messageCount > baselineState.messageCount || 
                            currentState.snapshot !== baselineState.snapshot;

      if (hasNewMessages || hasStateChange) {
        if (this.state.monitorInterval) {
          clearInterval(this.state.monitorInterval);
          this.state.monitorInterval = null;
        }
        
        setTimeout(async () => {
          if (!this.state.active) return;
          
          const newMessages = currentMessages.filter(m => 
            m.sender === 'participant' && 
            !lastKnownMessages.some(old => old.content === m.content)
          );
          
          if (newMessages.length > 0) {
            const latestReply = newMessages[newMessages.length - 1].content;
            if (latestReply && !this.isOurOwnMessage(latestReply)) {
              this.logDebug('MONITOR', 'New reply detected', latestReply.substring(0, 50) + '...');
              this.state.messageHistory.push({ role: 'user', content: latestReply });
              await this.processAndSendReply(latestReply);
            }
          }
          
          if (this.state.active) {
            this.startReplyMonitoring();
          }
        }, 2000);
      }
    }, 1000);

    this.logDebug('MONITOR', 'Reply monitoring started');
  }

  shouldStopConversation() {
    if (this.state.timeLimit) {
      const elapsedMinutes = (Date.now() - this.state.startTime) / (1000 * 60);
      if (elapsedMinutes >= this.state.timeLimit) {
        this.logDebug('LIMIT', 'Time limit reached', { elapsed: elapsedMinutes, limit: this.state.timeLimit });
        return true;
      }
    }

    if (this.state.messageCount && this.state.messagesSent >= this.state.messageCount) {
      this.logDebug('LIMIT', 'Message count reached', { sent: this.state.messagesSent, limit: this.state.messageCount });
      return true;
    }

    return false;
  }

  refreshInputReference() {
    try {
      if (this.isInputStillValid()) {
        return true;
      }

      const chatEditors = document.querySelectorAll('div[contenteditable="true"][role="textbox"][aria-label="Message"]');
      
      for (const editor of chatEditors) {
        const rect = editor.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.logDebug('REFRESH', 'Found new input reference');
          this.state.targetInput = editor;
          return true;
        }
      }
      
      return false;
    } catch (e) {
      this.logDebug('REFRESH', 'Failed to refresh input reference', e);
      return false;
    }
  }

  attemptReconnection() {
    try {
      if (this.refreshInputReference()) {
        return true;
      }

      const chatEditors = document.querySelectorAll('div[contenteditable="true"][role="textbox"]');
      
      for (const editor of chatEditors) {
        const rect = editor.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          try {
            editor.focus();
            this.logDebug('RECONNECT', 'Successfully reconnected to new input');
            this.state.targetInput = editor;
            return true;
          } catch (e) {
            continue;
          }
        }
      }
      
      this.logDebug('RECONNECT', 'No suitable input found');
      return false;
    } catch (e) {
      this.logDebug('RECONNECT', 'Reconnection failed with error', e);
      return false;
    }
  }

  isOurOwnMessage(text) {
    return this.state.messageHistory.some(m => 
      m.role === 'assistant' && text.includes(m.content.substring(0, 50))
    );
  }

  async processAndSendReply(replyText) {
    if (!this.state.active || this.state.isProcessing) return;
    this.state.isProcessing = true;

    try {
      this.logDebug('API', 'Processing reply', replyText.substring(0, 100) + '...');
      
      // Get all messages including the new reply
      const allMessages = this.extractChatMessages();
      
      // Format messages with roles
      const formattedMessages = allMessages.map(m => ({
        role: m.sender === 'user' ? 'model' : 'user',
        content: m.content
      }));

      // Join messages with role information
      const completeChatText = formattedMessages
        .map(m => `${m.role === 'user' ? 'Participant' : 'AI'}: ${m.content}`)
        .join('\n');
      
      const response = await fetch('http://localhost:5000/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: completeChatText,
          prime_directive: this.state.primeDirective,
          chat_id: this.instanceId,
          persona: {
            name: 'Frankie',
            description: this.state.primeDirective
          }
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const data = await response.json();
      this.logDebug('API', 'Received reply response', data);
      
      const messageText = data.processed_text || '';
      
      if (messageText && this.state.active) {
        this.logDebug('PROCESS', 'Processing reply message', messageText.substring(0, 100) + '...');
        this.state.messageHistory.push({ role: 'assistant', content: messageText });
        
        const success = await this.typeAndSendMessage(messageText);
        if (success !== false) {
          this.state.messagesSent++;
          this.updateConversationState();
          this.state.retryCount = 0;
        }
      }
    } catch (err) {
      this.logDebug('ERROR', 'Reply processing failed', err);
      await this.handleError();
    } finally {
      this.state.isProcessing = false;
    }
  }

  async handleError() {
    this.state.retryCount++;
    if (this.state.retryCount < this.state.maxRetries && this.state.active) {
      this.logDebug('RETRY', `Retrying... (${this.state.retryCount}/${this.state.maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return true;
    } else {
      this.logDebug('ERROR', 'Max retries reached, stopping conversation');
      this.stopConversation();
      return false;
    }
  }

  stopConversation() {
    this.state.active = false;
    
    if (this.state.monitorInterval) {
      clearInterval(this.state.monitorInterval);
      this.state.monitorInterval = null;
    }

    this.logDebug('STOP', 'Conversation stopped');
  }

  async attemptSend(targetInput) {
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

    return false;
  }

  findSendButton(input) {
    const container = input.closest('form, div, section, article') || input.parentElement;
    
    const selectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      '[role="button"]',
      '[aria-label*="Send" i]',
      '[aria-label*="Post" i]',
      '[title*="Send" i]',
      '[title*="Post" i]',
      '[data-testid*="send" i]',
      '[data-testid*="post" i]',
      'svg[aria-label*="Send" i]',
      'button:has(svg[aria-label*="Send" i])'
    ];

    for (const selector of selectors) {
      try {
        const elements = Array.from(container?.querySelectorAll(selector) || []);
        for (const element of elements) {
          const text = element.textContent?.toLowerCase() || '';
          const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
          const title = element.getAttribute('title')?.toLowerCase() || '';
          const dataTestid = element.getAttribute('data-testid')?.toLowerCase() || '';

          const isSend = text.includes('send') || text.includes('post') || 
                       ariaLabel.includes('send') || ariaLabel.includes('post') ||
                       title.includes('send') || title.includes('post') ||
                       dataTestid.includes('send') || dataTestid.includes('post');

          if (isSend) {
            const finalElement = element.tagName === 'SVG' ? 
              element.closest('[role="button"], button') || element.parentElement :
              element;

            if (finalElement && (finalElement.tagName === 'BUTTON' || 
                              finalElement.getAttribute('role') === 'button')) {
              this.logDebug('SEND', `Found send button with selector: ${selector}`);
              return finalElement;
            }
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    return null;
  }

  async typeIntoContentEditable(element, text) {
    return new Promise(async (resolve) => {
      try {
        this.logDebug('TYPE', 'Starting to type text', { 
          textLength: text.length, 
          textPreview: text.substring(0, 50) + '...',
          elementType: element.tagName,
          isContentEditable: element.contentEditable
        });

        element.innerHTML = '';
        element.textContent = '';
        const range = document.createRange();
        range.selectNodeContents(element);
        range.deleteContents();
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        element.focus();

        for (let i = 0; i < text.length; i++) {
          if (!this.state.active) break;
          document.execCommand('insertText', false, text[i]);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        this.logDebug('TYPE', 'ContentEditable typing completed');
        resolve();
      } catch (e) {
        this.logDebug('TYPE', 'ContentEditable typing failed', e);
        resolve();
      }
    });
  }

  async typeIntoTextarea(textarea, text) {
    return new Promise(async (resolve) => {
      try {
        this.logDebug('TYPE', 'Starting textarea typing', { 
          textLength: text.length, 
          textPreview: text.substring(0, 50) + '...',
          elementType: textarea.tagName
        });

        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise(r => setTimeout(r, 50));
        textarea.focus();

        for (let i = 0; i < text.length; i++) {
          if (!this.state.active) break;
          
          textarea.value += text[i];
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          await new Promise(r => setTimeout(r, 50));
        }

        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 100));

        this.logDebug('TYPE', 'Textarea typing completed');
        resolve();
      } catch (e) {
        this.logDebug('TYPE', 'Textarea typing failed', e);
        resolve();
      }
    });
  }

  // Add new methods for button handling
  createDeployButton() {
    const button = document.createElement('button');
    button.id = 'deploy-frankie-btn';
    button.className = 'frankie-btn deploy-btn';
    button.textContent = 'Deploy Frankie';
    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleDeployClick();
    };
    return button;
  }

  createStopButton() {
    const button = document.createElement('button');
    button.id = 'stop-frankie-btn';
    button.className = 'frankie-btn stop-btn';
    button.textContent = 'Stop Frankie';
    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleStopClick();
    };
    return button;
  }

  handleDeployClick() {
    // Show config drawer
    if (window.showConfigDrawer) {
      window.showConfigDrawer();
    }
  }

  handleStopClick() {
    // Stop the conversation without showing drawer
    this.stopConversation();
    this.updateButtonState();
  }

  updateButtonState() {
    const deployBtn = document.getElementById('deploy-frankie-btn');
    const stopBtn = document.getElementById('stop-frankie-btn');
    
    if (this.state.active) {
      if (deployBtn) deployBtn.style.display = 'none';
      if (stopBtn) stopBtn.style.display = 'block';
    } else {
      if (deployBtn) deployBtn.style.display = 'block';
      if (stopBtn) stopBtn.style.display = 'none';
    }
  }

  initializeButtons() {
    const container = document.createElement('div');
    container.className = 'frankie-button-container';
    
    const deployBtn = this.createDeployButton();
    const stopBtn = this.createStopButton();
    
    container.appendChild(deployBtn);
    container.appendChild(stopBtn);
    
    // Initially hide stop button
    stopBtn.style.display = 'none';
    
    document.body.appendChild(container);
  }
}

// Export for the content script
window.ConversationInstance = ConversationInstance;
export { ConversationInstance };
