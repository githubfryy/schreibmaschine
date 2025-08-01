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
   * Login as participant
   */
  loginAsParticipant(participantId, redirectUrl) {
    SchreibmaschineUtils.setCookie('schreibmaschine_session', participantId);
    window.location.href = redirectUrl;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return SchreibmaschineUtils.getCookie('schreibmaschine_session') !== null;
  },

  /**
   * Get current participant ID
   */
  getCurrentParticipantId() {
    return SchreibmaschineUtils.getCookie('schreibmaschine_session');
  },

  /**
   * Logout user
   */
  logout() {
    SchreibmaschineUtils.removeCookie('schreibmaschine_session');
    window.location.href = '/';
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

// Make functions globally available
window.SchreibmaschineUtils = SchreibmaschineUtils;
window.SchreibmaschineAuth = SchreibmaschineAuth;
window.SchreibmaschineActivity = SchreibmaschineActivity;
window.saveIndividualText = SchreibmaschineActivity.saveIndividualText;
window.exportText = SchreibmaschineActivity.exportText;
window.submitRhyme = SchreibmaschineActivity.submitRhyme;
window.markDrawingComplete = SchreibmaschineActivity.markDrawingComplete;