/**
 * Workshop Room Component System
 * Alpine.js components for collaborative writing interfaces
 * Based on Frontend Implementation Strategy patterns
 */

// Main Workshop Room State Management
Alpine.data('workshopRoom', (config) => ({
  // Core configuration
  groupId: config.groupId,
  participantId: config.participantId,
  isTeamer: config.isTeamer,
  
  // Real-time data
  participants: [],
  activities: [],
  onlineStatus: {},
  currentActivity: null,
  
  // UI state
  isConnected: false,
  notifications: [],
  eventSource: null,
  
  init() {
    this.loadInitialData();
    this.connectSSE();
    this.setupPersistedState();
    this.setupEventListeners();
  },
  
  // Computed properties
  get onlineCount() {
    return Object.values(this.onlineStatus).filter(status => status === 'online').length + 1; // +1 for current user
  },
  
  get activeActivity() {
    return this.activities.find(a => a.status === 'active');
  },
  
  get onlineParticipants() {
    return this.participants.filter(p => this.onlineStatus[p.id] === 'online' || p.id === this.participantId);
  },
  
  // Data loading
  async loadInitialData() {
    try {
      const [participants, activities] = await Promise.all([
        this.$ajax(`/api/groups/${this.groupId}/participants`),
        this.$ajax(`/api/groups/${this.groupId}/activities`)
      ]);
      
      this.participants = participants;
      this.activities = activities;
      
      // Find current activity
      this.currentActivity = this.activeActivity;
    } catch (error) {
      this.addNotification('Fehler beim Laden der Daten', 'error');
      console.error('Failed to load initial data:', error);
    }
  },
  
  // SSE Integration for real-time updates
  connectSSE() {
    if (this.eventSource) {
      this.eventSource.close();
    }
    
    this.eventSource = new EventSource(`/api/sse/group/${this.groupId}`);
    
    this.eventSource.onopen = () => {
      this.isConnected = true;
      this.addNotification('Verbindung hergestellt', 'success', 2000);
    };
    
    this.eventSource.addEventListener('participant:status', (event) => {
      const { participantId, status } = JSON.parse(event.data);
      this.onlineStatus[participantId] = status;
      
      if (status === 'online') {
        const participant = this.participants.find(p => p.id === participantId);
        if (participant) {
          this.addNotification(`${participant.display_name} ist online`, 'info', 3000);
        }
      }
    });
    
    this.eventSource.addEventListener('activity:update', (event) => {
      const activity = JSON.parse(event.data);
      this.updateActivity(activity);
      
      this.addNotification(`Activity "${activity.title}" wurde aktualisiert`, 'info', 3000);
    });
    
    this.eventSource.addEventListener('activity:turn', (event) => {
      const { activityId, currentPlayer } = JSON.parse(event.data);
      this.handleTurnChange(activityId, currentPlayer);
    });
    
    this.eventSource.addEventListener('participant:typing', (event) => {
      const { participantId, activityId, isTyping } = JSON.parse(event.data);
      this.handleTypingStatus(participantId, activityId, isTyping);
    });
    
    this.eventSource.onerror = () => {
      this.isConnected = false;
      this.addNotification('Verbindung unterbrochen', 'warning', 0); // Don't auto-dismiss
      
      // Retry connection after 5 seconds
      setTimeout(() => this.connectSSE(), 5000);
    };
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (this.eventSource) {
        this.eventSource.close();
      }
    });
  },
  
  // State updates
  updateActivity(updatedActivity) {
    const index = this.activities.findIndex(a => a.id === updatedActivity.id);
    if (index !== -1) {
      this.activities[index] = { ...this.activities[index], ...updatedActivity };
    } else {
      this.activities.push(updatedActivity);
    }
    
    // Update current activity if this is the active one
    if (updatedActivity.status === 'active') {
      this.currentActivity = updatedActivity;
    }
  },
  
  handleTurnChange(activityId, currentPlayer) {
    const activity = this.activities.find(a => a.id === activityId);
    if (activity) {
      activity.currentPlayer = currentPlayer;
      
      if (currentPlayer.id === this.participantId) {
        this.addNotification('Sie sind an der Reihe!', 'info', 5000);
        this.$dispatch('turn:yours', { activityId });
        
        // Play notification sound if available
        this.playNotificationSound();
      }
    }
  },
  
  handleTypingStatus(participantId, activityId, isTyping) {
    this.$dispatch('participant:typing', {
      participantId,
      activityId,
      isTyping
    });
  },
  
  // Notifications
  addNotification(message, type = 'info', duration = 5000) {
    const id = Date.now();
    const notification = { id, message, type, show: false };
    
    this.notifications.unshift(notification);
    
    this.$nextTick(() => {
      notification.show = true;
      
      if (duration > 0) {
        setTimeout(() => this.removeNotification(id), duration);
      }
    });
    
    // Limit notifications to prevent memory issues
    if (this.notifications.length > 10) {
      this.notifications = this.notifications.slice(0, 10);
    }
  },
  
  removeNotification(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.show = false;
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 300);
    }
  },
  
  // Persist state across page loads
  setupPersistedState() {
    this.$persist(this.participantId).as('current-participant');
    this.$persist(this.groupId).as('current-group');
  },
  
  // Event listeners
  setupEventListeners() {
    // Listen for global notification events
    window.addEventListener('notify', (event) => {
      this.addNotification(event.detail.message, event.detail.type, event.detail.duration);
    });
    
    // Listen for activity changes
    this.$watch('currentActivity', (newActivity) => {
      if (newActivity) {
        this.$dispatch('activity:changed', newActivity);
      }
    });
  },
  
  // Utility methods
  playNotificationSound() {
    // Simple notification sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Ignore audio errors
    }
  },
  
  // Cleanup
  destroy() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}));

// Individual Activity Components
Alpine.data('individualPad', (activityId, participantId) => ({
  activityId,
  participantId,
  content: '',
  saveStatus: 'saved', // 'saved', 'saving', 'error'
  wordCount: 0,
  characterCount: 0,
  isTyping: false,
  typingTimeout: null,
  
  init() {
    this.loadContent();
    this.$watch('content', (value) => {
      this.updateCounts(value);
      this.debouncedSave();
    });
  },
  
  async loadContent() {
    try {
      const response = await this.$ajax(`/api/activities/${this.activityId}/content`);
      this.content = response.content || '';
      this.updateCounts(this.content);
    } catch (error) {
      console.error('Failed to load content:', error);
      this.saveStatus = 'error';
    }
  },
  
  updateCounts(text) {
    this.characterCount = text.length;
    this.wordCount = text ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  },
  
  debouncedSave: Alpine.debounce(async function() {
    this.saveStatus = 'saving';
    
    try {
      await this.$ajax(`/api/activities/${this.activityId}/content`, {
        method: 'PUT',
        body: { content: this.content, participantId: this.participantId }
      });
      this.saveStatus = 'saved';
    } catch (error) {
      this.saveStatus = 'error';
      console.error('Auto-save failed:', error);
    }
  }, 1500),
  
  startTyping() {
    if (!this.isTyping) {
      this.isTyping = true;
      this.broadcastTyping(true);
    }
    
    // Reset typing timeout
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 3000);
  },
  
  stopTyping() {
    if (this.isTyping) {
      this.isTyping = false;
      this.broadcastTyping(false);
      clearTimeout(this.typingTimeout);
    }
  },
  
  async broadcastTyping(isTyping) {
    try {
      await this.$ajax(`/api/activities/${this.activityId}/typing`, {
        method: 'POST',
        body: { 
          participantId: this.participantId, 
          isTyping 
        }
      });
    } catch (error) {
      // Ignore typing broadcast errors
    }
  },
  
  get saveStatusText() {
    const statusMap = {
      saved: 'Gespeichert',
      saving: 'Speichere...',
      error: 'Fehler beim Speichern'
    };
    return statusMap[this.saveStatus] || this.saveStatus;
  }
}));

// Rhyming Chain Game Component
Alpine.data('rhymingChain', (activityId, participantId) => ({
  activityId,
  participantId,
  currentLine: '',
  gameState: null,
  canSkip: true,
  timeRemaining: 0,
  timerInterval: null,
  rhymeSuggestions: [],
  
  init() {
    this.loadGameState();
    this.setupTurnListener();
  },
  
  async loadGameState() {
    try {
      const response = await this.$ajax(`/api/activities/${this.activityId}/game-state`);
      this.gameState = response;
      
      if (response.timeRemaining) {
        this.timeRemaining = response.timeRemaining;
        this.startTimer();
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  },
  
  setupTurnListener() {
    this.$listen('turn:yours', (event) => {
      if (event.detail.activityId === this.activityId) {
        this.focusInput();
        this.startTimer();
      }
    });
  },
  
  async submitLine() {
    if (!this.currentLine.trim()) return;
    
    try {
      await this.$ajax(`/api/activities/${this.activityId}/submit-line`, {
        method: 'POST',
        body: { 
          line: this.currentLine.trim(),
          participantId: this.participantId
        }
      });
      
      this.currentLine = '';
      this.stopTimer();
      this.$dispatch('line:submitted', { activityId: this.activityId });
      
      this.$dispatch('notify', {
        message: 'Zeile abgegeben',
        type: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to submit line:', error);
      this.$dispatch('notify', {
        message: 'Fehler beim Abgeben der Zeile',
        type: 'error'
      });
    }
  },
  
  async skipTurn() {
    if (!this.canSkip) return;
    
    try {
      await this.$ajax(`/api/activities/${this.activityId}/skip-turn`, {
        method: 'POST',
        body: { participantId: this.participantId }
      });
      
      this.stopTimer();
      this.$dispatch('turn:skipped', { activityId: this.activityId });
      
      this.$dispatch('notify', {
        message: 'Runde übersprungen',
        type: 'info',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to skip turn:', error);
    }
  },
  
  checkRhyme() {
    // Simple rhyme checking - could be enhanced with rhyme API
    const line = this.currentLine.toLowerCase().trim();
    if (line.length > 3) {
      const ending = line.slice(-2);
      this.rhymeSuggestions = this.generateRhymeSuggestions(ending);
    } else {
      this.rhymeSuggestions = [];
    }
  },
  
  generateRhymeSuggestions(ending) {
    // Simple rhyme generation - would be replaced with proper rhyme dictionary
    const commonRhymes = {
      'en': ['hen', 'den', 'pen', 'ten', 'when'],
      'er': ['her', 'fur', 'sir', 'per', 'were'],
      'in': ['win', 'sin', 'tin', 'pin', 'din'],
      'at': ['hat', 'cat', 'bat', 'mat', 'rat'],
      'ay': ['way', 'say', 'day', 'may', 'play']
    };
    
    return commonRhymes[ending] || [];
  },
  
  applyRhyme(rhyme) {
    const words = this.currentLine.trim().split(' ');
    words[words.length - 1] = rhyme;
    this.currentLine = words.join(' ');
  },
  
  startTimer() {
    if (this.gameState?.turnTimeLimit) {
      this.timeRemaining = this.gameState.turnTimeLimit * 60; // Convert to seconds
      
      this.timerInterval = setInterval(() => {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          this.handleTimeUp();
        }
      }, 1000);
    }
  },
  
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },
  
  handleTimeUp() {
    this.stopTimer();
    this.$dispatch('notify', {
      message: 'Zeit abgelaufen! Runde wird automatisch übersprungen.',
      type: 'warning'
    });
    this.skipTurn();
  },
  
  focusInput() {
    this.$nextTick(() => {
      const input = this.$el.querySelector('.rhyme-input');
      if (input) input.focus();
    });
  },
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },
  
  get isLastRound() {
    return this.gameState?.isLastRound || false;
  }
}));

// Collaborative Pad Component
Alpine.data('collaborativePad', (activityId, participantId) => ({
  activityId,
  participantId,
  content: '',
  saveStatus: 'saved',
  wordCount: 0,
  isConnected: true,
  activeParticipants: [],
  typingParticipants: [],
  
  init() {
    this.loadContent();
    this.setupCollaboration();
    this.$watch('content', (value) => {
      this.updateWordCount(value);
      this.debouncedSave();
    });
  },
  
  async loadContent() {
    try {
      const response = await this.$ajax(`/api/activities/${this.activityId}/collaborative-content`);
      this.content = response.content || '';
      this.activeParticipants = response.activeParticipants || [];
      this.updateWordCount(this.content);
    } catch (error) {
      console.error('Failed to load collaborative content:', error);
    }
  },
  
  setupCollaboration() {
    // Listen for typing indicators
    this.$listen('participant:typing', (event) => {
      const { participantId, activityId, isTyping } = event.detail;
      
      if (activityId === this.activityId && participantId !== this.participantId) {
        if (isTyping) {
          if (!this.typingParticipants.find(p => p.id === participantId)) {
            const participant = this.activeParticipants.find(p => p.id === participantId);
            if (participant) {
              this.typingParticipants.push(participant);
            }
          }
        } else {
          this.typingParticipants = this.typingParticipants.filter(p => p.id !== participantId);
        }
      }
    });
  },
  
  handleInput() {
    this.startTyping();
    this.updateWordCount(this.content);
  },
  
  startTyping() {
    this.broadcastTyping(true);
    
    // Auto-stop typing after 3 seconds of inactivity
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 3000);
  },
  
  stopTyping() {
    this.broadcastTyping(false);
    clearTimeout(this.typingTimeout);
  },
  
  async broadcastTyping(isTyping) {
    try {
      await this.$ajax(`/api/activities/${this.activityId}/typing`, {
        method: 'POST',
        body: { 
          participantId: this.participantId, 
          isTyping 
        }
      });
    } catch (error) {
      // Ignore typing broadcast errors
    }
  },
  
  updateWordCount(text) {
    this.wordCount = text ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  },
  
  debouncedSave: Alpine.debounce(async function() {
    this.saveStatus = 'saving';
    
    try {
      await this.$ajax(`/api/activities/${this.activityId}/collaborative-content`, {
        method: 'PUT',
        body: { 
          content: this.content, 
          participantId: this.participantId 
        }
      });
      this.saveStatus = 'saved';
    } catch (error) {
      this.saveStatus = 'error';
      this.isConnected = false;
      console.error('Collaborative save failed:', error);
    }
  }, 2000),
  
  getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  },
  
  get saveStatusText() {
    const statusMap = {
      saved: 'Gespeichert',
      saving: 'Speichere...',
      error: 'Fehler beim Speichern'
    };
    return statusMap[this.saveStatus] || this.saveStatus;
  }
}));

// Notification System Component
Alpine.data('notificationSystem', () => ({
  notifications: [],
  
  init() {
    // Listen for global notification events
    window.addEventListener('notify', (event) => {
      this.add(event.detail.message, event.detail.type, event.detail.duration);
    });
    
    this.$listen('notify', (event) => {
      this.add(event.detail.message, event.detail.type, event.detail.duration);
    });
  },
  
  add(message, type = 'info', duration = 5000) {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, show: false };
    
    this.notifications.unshift(notification);
    
    this.$nextTick(() => {
      notification.show = true;
      
      if (duration > 0) {
        setTimeout(() => this.remove(id), duration);
      }
    });
    
    // Limit to 5 notifications
    if (this.notifications.length > 5) {
      this.notifications = this.notifications.slice(0, 5);
    }
  },
  
  remove(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.show = false;
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      }, 300);
    }
  }
}));

// Activity Card Component
Alpine.data('activityCard', (activityId, participantId) => ({
  activityId,
  participantId,
  
  async toggleActivityStatus() {
    try {
      const response = await this.$ajax(`/api/activities/${this.activityId}/toggle-status`, {
        method: 'POST',
        body: { participantId: this.participantId }
      });
      
      this.$dispatch('activity:updated', response.activity);
      
      const statusText = response.activity.status === 'active' ? 'gestartet' : 'pausiert';
      this.$dispatch('notify', {
        message: `Activity wurde ${statusText}`,
        type: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to toggle activity status:', error);
      this.$dispatch('notify', {
        message: 'Fehler beim Ändern des Activity-Status',
        type: 'error'
      });
    }
  }
}));

// Global helper for dispatching notifications
window.notify = function(message, type = 'info', duration = 5000) {
  window.dispatchEvent(new CustomEvent('notify', {
    detail: { message, type, duration }
  }));
};