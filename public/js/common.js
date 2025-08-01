/**
 * Common JavaScript functionality for Schreibmaschine
 * TODO: Replace with Alpine.js or DataStar for reactive components
 */

// Utility functions
const SchreibmaschineUtils = {
  /**
   * Set a cookie with given name, value, and options
   */
  setCookie(name, value, options = {}) {
    const defaults = {
      path: '/',
      maxAge: 604800 // 7 days
    };
    
    const opts = { ...defaults, ...options };
    let cookieString = `${name}=${value}`;
    
    Object.entries(opts).forEach(([key, val]) => {
      if (val !== undefined) {
        cookieString += `; ${key}=${val}`;
      }
    });
    
    document.cookie = cookieString;
  },

  /**
   * Get cookie value by name
   */
  getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  },

  /**
   * Remove cookie by name
   */
  removeCookie(name) {
    this.setCookie(name, '', { maxAge: 0 });
  },

  /**
   * Format time remaining
   */
  formatTimeRemaining(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  /**
   * Count words in text
   */
  countWords(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  },

  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Authentication helpers
const SchreibmaschineAuth = {
  /**
   * Login participant to group using new API
   */
  async loginToGroup(participantId, workshopGroupId) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participantId,
          workshopGroupId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Start SSE connection after successful login
        SchreibmaschineSSE.connect(workshopGroupId);
        return result;
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Legacy login as participant (kept for compatibility)
   */
  loginAsParticipant(participantId, redirectUrl) {
    SchreibmaschineUtils.setCookie('schreibmaschine_session', participantId);
    window.location.href = redirectUrl;
  },

  /**
   * Logout current user
   */
  async logout() {
    try {
      // Disconnect SSE before logout
      SchreibmaschineSSE.disconnect();
      
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        SchreibmaschineUtils.removeCookie('schreibmaschine_session');
        window.location.href = '/';
      }
      
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to legacy logout
      SchreibmaschineUtils.removeCookie('schreibmaschine_session');
      window.location.href = '/';
    }
  },

  /**
   * Check current session status with server
   */
  async checkSession() {
    try {
      const response = await fetch('/api/session');
      const result = await response.json();
      
      if (result.authenticated) {
        // Start SSE connection if authenticated
        if (result.workshopGroup && !SchreibmaschineSSE.eventSource) {
          SchreibmaschineSSE.connect(result.workshopGroup.id);
        }
      } else {
        SchreibmaschineSSE.disconnect();
      }
      
      return result;
    } catch (error) {
      console.error('Session check error:', error);
      return { authenticated: false };
    }
  },

  /**
   * Check if user is authenticated (legacy)
   */
  isAuthenticated() {
    return SchreibmaschineUtils.getCookie('schreibmaschine_session') !== null;
  },

  /**
   * Get current participant ID (legacy)
   */
  getCurrentParticipantId() {
    return SchreibmaschineUtils.getCookie('schreibmaschine_session');
  }
};

// Server-Sent Events (SSE) helpers
const SchreibmaschineSSE = {
  eventSource: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,

  /**
   * Connect to SSE stream for a workshop group
   */
  connect(workshopGroupId) {
    if (this.eventSource) {
      this.disconnect();
    }

    console.log(`📡 Connecting to SSE for group ${workshopGroupId}`);
    
    this.eventSource = new EventSource(`/api/groups/${workshopGroupId}/events`);

    this.eventSource.onopen = () => {
      console.log('📡 SSE connection opened');
      this.reconnectAttempts = 0;
      this.showToast('Mit Gruppe verbunden', 'success');
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleEvent(data);
      } catch (error) {
        console.error('Failed to parse SSE event:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => {
          this.connect(workshopGroupId);
        }, delay);
      } else {
        this.showToast('Verbindung zur Gruppe verloren', 'error');
        this.disconnect();
      }
    };
  },

  /**
   * Disconnect from SSE stream
   */
  disconnect() {
    if (this.eventSource) {
      console.log('📡 Disconnecting SSE');
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectAttempts = 0;
  },

  /**
   * Handle incoming SSE events
   */
  handleEvent(event) {
    console.log('📡 SSE Event:', event);

    switch (event.type) {
      case 'connected':
        this.showToast('Verbunden mit Gruppe', 'success');
        break;
        
      case 'online_status':
        this.handleOnlineStatus(event.data);
        break;
        
      case 'activity_update':
        this.handleActivityUpdate(event.data);
        break;
        
      case 'group_update':
        this.handleGroupUpdate(event.data);
        break;
        
      case 'heartbeat':
        // Silent heartbeat
        break;
        
      default:
        console.log('Unknown SSE event type:', event.type);
    }

    // Emit custom DOM event for other parts of the app to listen to
    document.dispatchEvent(new CustomEvent('sse-event', {
      detail: event
    }));
  },

  /**
   * Handle online status updates
   */
  handleOnlineStatus(data) {
    // Update UI with online participants
    const onlineElement = document.getElementById('online-participants');
    if (onlineElement) {
      const participantsList = data.online_participants
        .map(p => `<span class="participant online">${p.display_name}</span>`)
        .join('');
      
      onlineElement.innerHTML = `
        <h3>Online (${data.total_online})</h3>
        <div class="participants-list">${participantsList}</div>
      `;
    }

    // Update online indicator
    const onlineIndicator = document.getElementById('online-indicator');
    if (onlineIndicator) {
      onlineIndicator.textContent = `${data.total_online} online`;
      onlineIndicator.className = data.total_online > 0 ? 'online' : 'offline';
    }
  },

  /**
   * Handle activity updates
   */
  handleActivityUpdate(data) {
    this.showToast(`Aktivität aktualisiert: ${data.status}`, 'info');
    
    // Refresh activity display if needed
    const activityElement = document.getElementById(`activity-${data.activity_id}`);
    if (activityElement) {
      activityElement.classList.add('updated');
      setTimeout(() => activityElement.classList.remove('updated'), 2000);
    }
  },

  /**
   * Handle group updates
   */
  handleGroupUpdate(data) {
    switch (data.update_type) {
      case 'participant_joined':
        this.showToast('Neuer Teilnehmer ist beigetreten', 'info');
        break;
      case 'participant_left':
        this.showToast('Teilnehmer hat die Gruppe verlassen', 'info');
        break;
      case 'status_changed':
        this.showToast('Gruppenstatus wurde geändert', 'info');
        break;
    }
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    
    // Set background color based on type
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8',
      warning: '#ffc107'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }
    }, 3000);
  }
};

// Activity helpers
const SchreibmaschineActivity = {
  /**
   * Save individual text
   */
  saveIndividualText() {
    const textarea = document.getElementById('individual-text');
    if (!textarea) return;
    
    const text = textarea.value;
    const wordCount = SchreibmaschineUtils.countWords(text);
    
    // Update word count display
    const wordCountElement = document.getElementById('word-count');
    if (wordCountElement) {
      wordCountElement.textContent = wordCount;
    }
    
    // TODO: Save to server via API
    console.log('Saving individual text:', { text, wordCount });
    
    // Show temporary feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '💾 Gespeichert!';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  },

  /**
   * Export text content
   */
  exportText() {
    const textarea = document.getElementById('individual-text');
    if (!textarea) return;
    
    const text = textarea.value;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_');
    const filename = `schreibmaschine_text_${timestamp}.txt`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
  },

  /**
   * Submit rhyme in rhyming chain
   */
  submitRhyme() {
    const input = document.getElementById('rhyme-input');
    if (!input) return;
    
    const rhyme = input.value.trim();
    if (!rhyme) return;
    
    // TODO: Submit to server via API
    console.log('Submitting rhyme:', rhyme);
    
    // Clear input and show feedback
    input.value = '';
    input.placeholder = 'Reim gesendet, warte auf andere...';
    input.disabled = true;
  },

  /**
   * Mark drawing as complete
   */
  markDrawingComplete() {
    // TODO: Submit completion to server
    console.log('Marking drawing as complete');
    
    const button = event.target;
    button.textContent = '✅ Fertig gemeldet!';
    button.disabled = true;
  }
};

// Auto-update word count for textareas
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('individual-text');
  if (textarea) {
    const updateWordCount = SchreibmaschineUtils.debounce(() => {
      const wordCount = SchreibmaschineUtils.countWords(textarea.value);
      const wordCountElement = document.getElementById('word-count');
      if (wordCountElement) {
        wordCountElement.textContent = wordCount;
      }
    }, 300);
    
    textarea.addEventListener('input', updateWordCount);
    updateWordCount(); // Initial count
  }
});

// Auto-initialize session check on page load
document.addEventListener('DOMContentLoaded', () => {
  SchreibmaschineAuth.checkSession();
});

// Cleanup SSE connection when page unloads
window.addEventListener('beforeunload', () => {
  SchreibmaschineSSE.disconnect();
});

// Make functions globally available
window.SchreibmaschineUtils = SchreibmaschineUtils;
window.SchreibmaschineAuth = SchreibmaschineAuth;
window.SchreibmaschineSSE = SchreibmaschineSSE;
window.SchreibmaschineActivity = SchreibmaschineActivity;
window.saveIndividualText = SchreibmaschineActivity.saveIndividualText;
window.exportText = SchreibmaschineActivity.exportText;
window.submitRhyme = SchreibmaschineActivity.submitRhyme;
window.markDrawingComplete = SchreibmaschineActivity.markDrawingComplete;