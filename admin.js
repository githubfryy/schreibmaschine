/**
 * Schreibmaschine - Admin-Logik
 * Erstellt und verwaltet Schreibsessions
 */

// DOM-Elemente
const promptSetSelect = document.getElementById('prompt-set');
const timerModeSelect = document.getElementById('timer-mode');
const timerIntervalsInput = document.getElementById('timer-intervals');
const timerHint = document.getElementById('timer-hint');
const timerVisibilityCheckbox = document.getElementById('timer-visibility');
const createSessionButton = document.getElementById('create-session');
const sessionInfo = document.getElementById('session-info');
const sessionCodeDisplay = document.getElementById('session-code-display');
const copyCodeButton = document.getElementById('copy-code');
const newSessionButton = document.getElementById('new-session');
const joinAsAdminButton = document.getElementById('join-as-admin');

// Globale Variablen
let currentSessionCode = null;
let loadedPromptSets = {};

// Event-Listener
document.addEventListener('DOMContentLoaded', init);

/**
 * Initialisierung
 */
async function init() {
  // Event-Listener
  timerModeSelect.addEventListener('change', updateTimerHint);
  createSessionButton.addEventListener('click', createSession);
  copyCodeButton.addEventListener('click', copySessionCode);
  newSessionButton.addEventListener('click', resetForm);
  joinAsAdminButton.addEventListener('click', joinAsAdmin);
  
  // Timer-Hinweis initialisieren
  updateTimerHint();
  
  // Prompt-Sets laden
  await loadPromptSets();
}

/**
 * Lädt verfügbare Prompt-Sets
 */
async function loadPromptSets() {
  try {
    // Liste der Prompt-Dateien laden
    const response = await fetch('prompts/');
    
    if (!response.ok) {
      // Fallback zu Standardsets, wenn das Verzeichnis nicht lesbar ist
      createDefaultOptions();
      return;
    }
    
    // HTML-Antwort nach Links durchsuchen
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');
    
    // Prompt-Set Optionen hinzufügen
    let foundOptions = false;
    
    for (const link of links) {
      const href = link.getAttribute('href');
      if (href && href.endsWith('.md')) {
        const name = href.replace(/\.md$/, '');
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        promptSetSelect.appendChild(option);
        foundOptions = true;
      }
    }
    
    if (!foundOptions) {
      createDefaultOptions();
    }
  } catch (error) {
    console.error('Fehler beim Laden der Prompt-Sets:', error);
    createDefaultOptions();
  }
}

/**
 * Erstellt Standard-Optionen für Prompt-Sets
 */
function createDefaultOptions() {
  // Standard-Optionen hinzufügen
  const defaultOptions = ['default', 'romantik', 'mystery', 'neu'];
  for (const name of defaultOptions) {
    if (name === 'default') continue; // Überspringe 'default', da es bereits vorhanden ist
    
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    promptSetSelect.appendChild(option);
  }
}

/**
 * Aktualisiert den Hinweistext basierend auf dem ausgewählten Timer-Modus
 */
function updateTimerHint() {
  const mode = timerModeSelect.value;
  
  switch (mode) {
    case 'fixed':
      timerHint.textContent = 'Für konstante Zeit einen Wert eingeben (z.B. "10")';
      break;
      
    case 'variable':
      timerHint.textContent = 'Komma-getrennte Werte eingeben (z.B. "5,8,10,8")';
      break;
      
    case 'random':
      timerHint.textContent = 'Min-Max Bereich eingeben (z.B. "5-12")';
      break;
  }
}

/**
 * Erstellt eine neue Schreibsession
 */
async function createSession() {
  // Eingaben validieren
  const promptSet = promptSetSelect.value;
  const timerMode = timerModeSelect.value;
  const timerIntervals = timerIntervalsInput.value;
  
  if (!timerIntervals) {
    alert('Bitte gib Timer-Intervalle ein.');
    return;
  }
  
  // Timer-Intervalle parsen
  const parsedIntervals = parseTimerIntervals(timerMode, timerIntervals);
  if (!parsedIntervals) {
    alert('Ungültige Timer-Intervalle. Bitte überprüfe das Format.');
    return;
  }
  
  // Prompt-Set laden
  try {
    // Prompt-Datei laden
    const promptsData = await loadPromptFile(promptSet);
    if (!promptsData) {
      throw new Error('Keine Prompts gefunden');
    }
    
    // Session-Code generieren
    const sessionCode = generateRandomId(6);
    currentSessionCode = sessionCode;
    
    // Session-Konfiguration erstellen
    const sessionConfig = {
      sessionCode,
      promptSet,
      timerMode,
      timerIntervals: parsedIntervals,
      anfangsPrompts: promptsData['Anfangsprompts'] || [],
      ereignisPrompts: promptsData['Ereignisprompts'] || [],
      timerVisible: timerVisibilityCheckbox.checked,
      createdAt: new Date().toISOString()
    };
    
    // Prüfen, ob genügend Prompts vorhanden sind
    if (sessionConfig.anfangsPrompts.length === 0) {
      alert('Keine Anfangsprompts gefunden. Bitte wähle ein anderes Set oder prüfe die Markdown-Datei.');
      return;
    }
    
    if (sessionConfig.ereignisPrompts.length === 0) {
      alert('Keine Ereignisprompts gefunden. Bitte wähle ein anderes Set oder prüfe die Markdown-Datei.');
      return;
    }
    
    // Session speichern
    saveToStorage(`session_${sessionCode}`, sessionConfig);
    
    // Session-Info anzeigen
    sessionCodeDisplay.textContent = sessionCode;
    document.querySelector('.admin-panel').classList.add('hidden');
    sessionInfo.classList.remove('hidden');
    
  } catch (error) {
    console.error('Fehler beim Erstellen der Session:', error);
    alert('Fehler beim Erstellen der Session: ' + error.message);
  }
}

/**
 * Lädt eine Prompt-Datei und parst ihren Inhalt
 */
async function loadPromptFile(filename) {
  // Prüfen, ob wir die Datei bereits geladen haben
  if (loadedPromptSets[filename]) {
    return loadedPromptSets[filename];
  }
  
  try {
    // Datei laden
    const response = await fetch(`prompts/${filename}.md`);
    
    if (!response.ok) {
      // Fallback zu Default-Prompts
      return getDefaultPrompts();
    }
    
    const markdown = await response.text();
    const parsedData = parseMarkdownPrompts(markdown);
    
    // Geparste Daten cachen
    loadedPromptSets[filename] = parsedData;
    return parsedData;
    
  } catch (error) {
    console.error('Fehler beim Laden der Prompt-Datei:', error);
    return getDefaultPrompts();
  }
}

/**
 * Liefert Standard-Prompts als Fallback
 */
function getDefaultPrompts() {
  return {
    'Anfangsprompts': [
      'Sie lief barfuß, sie lief behende...',
      'Der Regen prasselte auf das Dach, als...',
      'In der Dunkelheit konnte sie nur...',
      'Die Uhr schlug Mitternacht, als...',
      'Ein seltsamer Geruch lag in der Luft...'
    ],
    'Ereignisprompts': [
      'Jemand wird sehr eifersüchtig',
      'Ein Baum fällt um',
      'Jemand bricht sich ein Bein',
      'Ein Rufen ertönt aus der Ferne',
      'Ein Brief kommt an',
      'Ein unerwarteter Besucher erscheint',
      'Ein Geheimnis wird gelüftet'
    ]
  };
}

/**
 * Kopiert den Session-Code in die Zwischenablage
 */
function copySessionCode() {
  if (!currentSessionCode) return;
  
  navigator.clipboard.writeText(currentSessionCode).then(() => {
    copyCodeButton.textContent = 'Kopiert!';
    setTimeout(() => {
      copyCodeButton.textContent = 'Kopieren';
    }, 2000);
  }).catch(err => {
    console.error('Fehler beim Kopieren in die Zwischenablage:', err);
    alert('Fehler beim Kopieren: ' + err.message);
  });
}

/**
 * Setzt das Formular zurück
 */
function resetForm() {
  timerIntervalsInput.value = '';
  timerVisibilityCheckbox.checked = true;
  currentSessionCode = null;
  document.querySelector('.admin-panel').classList.remove('hidden');
  sessionInfo.classList.add('hidden');
}

/**
 * Admin nimmt an der eigenen Session teil
 */
function joinAsAdmin() {
  if (!currentSessionCode) return;
  window.location.href = `index.html?session=${currentSessionCode}&admin=true`;
}
