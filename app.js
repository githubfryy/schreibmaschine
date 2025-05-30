/**
 * Schreibmaschine - Hauptlogik für Teilnehmer
 * Steuert die Anzeige der Prompts, Timer und Session-Steuerung
 */

// DOM-Elemente
const sessionStartScreen = document.getElementById('session-start');
const promptScreen = document.getElementById('prompt-screen');
const sessionEndScreen = document.getElementById('session-end');
const sessionCodeInput = document.getElementById('session-code');
const joinSessionButton = document.getElementById('join-session');
const currentPromptElement = document.getElementById('current-prompt');
const timerElement = document.getElementById('timer');
const toggleTimerButton = document.getElementById('toggle-timer');
const nextPromptButton = document.getElementById('next-prompt');
const restartButton = document.getElementById('restart');

// Session-Variablen
let sessionConfig = null;
let sessionState = null;
let timerInterval = null;

// Event-Listener
document.addEventListener('DOMContentLoaded', init);

/**
 * Initialisierung der App
 */
function init() {
  // Bestehende Session prüfen
  checkExistingSession();
  
  // Event-Listener hinzufügen
  joinSessionButton.addEventListener('click', joinSession);
  sessionCodeInput.addEventListener('keyup', e => {
    if (e.key === 'Enter') joinSession();
  });
  toggleTimerButton.addEventListener('click', toggleTimerVisibility);
  nextPromptButton.addEventListener('click', nextPrompt);
  restartButton.addEventListener('click', restartApp);
}

/**
 * Prüft, ob bereits eine aktive Session vorhanden ist
 */
function checkExistingSession() {
  const savedState = loadFromStorage('current_session');
  if (savedState && savedState.isActive) {
    const savedConfig = loadFromStorage(`session_${savedState.sessionCode}`);
    if (savedConfig) {
      sessionConfig = savedConfig;
      sessionState = savedState;
      startSession();
      return;
    }
  }
  
  // Keine aktive Session gefunden - Startbildschirm anzeigen
  showScreen(sessionStartScreen);
}

/**
 * Startet eine Session basierend auf dem eingegebenen Code
 */
async function joinSession() {
  const sessionCode = sessionCodeInput.value.trim().toUpperCase();
  if (!sessionCode || sessionCode.length !== 6) {
    alert('Bitte gib einen gültigen 6-stelligen Session-Code ein.');
    return;
  }
  
  // Session-Config laden
  const config = loadFromStorage(`session_${sessionCode}`);
  if (!config) {
    alert('Session nicht gefunden. Bitte überprüfe den Session-Code.');
    return;
  }
  
  // Session-Config und initialen State speichern
  sessionConfig = config;
  
  // Neuer Session-State erstellen
  sessionState = {
    sessionCode,
    currentStep: 0,
    currentPrompt: '',
    timerEndTime: 0,
    timerVisible: true,
    usedPrompts: [],
    isActive: true
  };
  
  saveToStorage('current_session', sessionState);
  startSession();
}

/**
 * Startet die Session und zeigt den ersten Prompt an
 */
function startSession() {
  // Session-Bildschirm anzeigen
  showScreen(promptScreen);
  
  // Timer-Sichtbarkeit aus dem State wiederherstellen
  if (sessionState.timerVisible) {
    document.body.classList.remove('timer-hidden');
    toggleTimerButton.textContent = 'Timer ausblenden';
  } else {
    document.body.classList.add('timer-hidden');
    toggleTimerButton.textContent = 'Timer einblenden';
  }
  
  // Ersten Prompt anzeigen, wenn wir bei Schritt 0 sind
  if (sessionState.currentStep === 0) {
    loadNextPrompt();
  } else {
    // Bestehenden Prompt und Timer wiederherstellen
    currentPromptElement.textContent = sessionState.currentPrompt;
    if (sessionState.timerEndTime > Date.now()) {
      startTimerFromEndTime(sessionState.timerEndTime);
    } else {
      // Timer ist bereits abgelaufen, direkt zum nächsten Prompt
      loadNextPrompt();
    }
  }
}

/**
 * Lädt den nächsten Prompt basierend auf dem aktuellen Schritt
 */
function loadNextPrompt() {
  let prompt = null;
  
  if (sessionState.currentStep === 0) {
    // Anfangsprompt laden
    prompt = getRandomUnusedPrompt(sessionConfig.anfangsPrompts, sessionState.usedPrompts);
  } else {
    // Ereignisprompt laden
    prompt = getRandomUnusedPrompt(sessionConfig.ereignisPrompts, sessionState.usedPrompts);
  }
  
  if (!prompt) {
    // Keine Prompts mehr übrig - Session beenden
    endSession();
    return;
  }
  
  // Prompt anzeigen und State aktualisieren
  currentPromptElement.textContent = prompt;
  currentPromptElement.classList.add('new-prompt');
  setTimeout(() => currentPromptElement.classList.remove('new-prompt'), 500);
  
  // Verwendete Prompts aktualisieren
  sessionState.usedPrompts.push(prompt);
  sessionState.currentPrompt = prompt;
  
  // Timer starten
  const durationSeconds = getNextTimerDuration(
    sessionState.currentStep,
    sessionConfig.timerMode,
    sessionConfig.timerIntervals
  );
  
  const endTime = Date.now() + (durationSeconds * 1000);
  sessionState.timerEndTime = endTime;
  
  // State speichern und Timer starten
  saveToStorage('current_session', sessionState);
  startTimerFromEndTime(endTime);
}

/**
 * Startet den Timer basierend auf der Endzeit
 */
function startTimerFromEndTime(endTime) {
  clearInterval(timerInterval);
  
  // Timer-Update-Funktion
  const updateTimer = () => {
    const remaining = Math.max(0, endTime - Date.now());
    timerElement.textContent = formatTime(remaining / 1000);
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      onTimerEnd();
    }
  };
  
  // Initial anzeigen und dann regelmäßig aktualisieren
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Handler für Timer-Ende
 */
function onTimerEnd() {
  // Timer-Ende-Animation
  promptScreen.classList.add('timer-end');
  setTimeout(() => promptScreen.classList.remove('timer-end'), 1000);
  
  // Zum nächsten Prompt wechseln
  sessionState.currentStep++;
  saveToStorage('current_session', sessionState);
  
  // Kurze Verzögerung für die Animation
  setTimeout(loadNextPrompt, 1000);
}

/**
 * Manuell zum nächsten Prompt wechseln (Admin-Funktion)
 */
function nextPrompt() {
  clearInterval(timerInterval);
  onTimerEnd();
}

/**
 * Session beenden
 */
function endSession() {
  clearInterval(timerInterval);
  
  // Session als inaktiv markieren
  sessionState.isActive = false;
  saveToStorage('current_session', sessionState);
  
  // End-Screen anzeigen
  showScreen(sessionEndScreen);
}

/**
 * App neu starten
 */
function restartApp() {
  sessionConfig = null;
  sessionState = null;
  clearInterval(timerInterval);
  
  // Session-Code-Input zurücksetzen
  sessionCodeInput.value = '';
  
  // Zurück zum Start-Screen
  showScreen(sessionStartScreen);
}

/**
 * Timer-Sichtbarkeit umschalten
 */
function toggleTimerVisibility() {
  sessionState.timerVisible = !sessionState.timerVisible;
  
  if (sessionState.timerVisible) {
    document.body.classList.remove('timer-hidden');
    toggleTimerButton.textContent = 'Timer ausblenden';
  } else {
    document.body.classList.add('timer-hidden');
    toggleTimerButton.textContent = 'Timer einblenden';
  }
  
  saveToStorage('current_session', sessionState);
}

/**
 * Hilfsfunktion zum Umschalten der sichtbaren Screens
 */
function showScreen(screenElement) {
  // Alle Screens ausblenden
  sessionStartScreen.classList.add('hidden');
  promptScreen.classList.add('hidden');
  sessionEndScreen.classList.add('hidden');
  
  // Gewünschten Screen einblenden
  screenElement.classList.remove('hidden');
}
