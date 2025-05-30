/**
 * Schreibmaschine - Gemeinsame Funktionen
 * Enthält Hilfsfunktionen, die sowohl von app.js als auch admin.js verwendet werden
 */

/**
 * Parst einen Markdown-Text in ein Array von Prompts
 * Erwartet ein Format wie:
 * # Überschrift
 * - Prompt 1
 * - Prompt 2
 */
function parseMarkdownPrompts(markdownText) {
  // Objekt für verschiedene Prompt-Kategorien
  const promptCategories = {};
  
  // Aktuelle Kategorie (z.B. "Anfangsprompts", "Ereignisprompts")
  let currentCategory = "";
  
  // Zeilenweise parsen
  const lines = markdownText.split('\n');
  
  for (const line of lines) {
    // Überschrift gefunden (# Kategorie)
    if (line.startsWith('#')) {
      currentCategory = line.replace(/^#+\s*/, '').trim();
      promptCategories[currentCategory] = [];
    } 
    // Prompt-Zeile gefunden (- Prompt)
    else if (line.trim().startsWith('-') && currentCategory) {
      const prompt = line.replace(/^-\s*/, '').trim();
      if (prompt) {
        promptCategories[currentCategory].push(prompt);
      }
    }
  }
  
  return promptCategories;
}

/**
 * Speichert Daten im LocalStorage
 */
function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Fehler beim Speichern in LocalStorage:', error);
    return false;
  }
}

/**
 * Lädt Daten aus dem LocalStorage
 */
function loadFromStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Fehler beim Laden aus LocalStorage:', error);
    return null;
  }
}

/**
 * Formatiert Sekunden in MM:SS Format
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Fügt einer Date-Instanz Minuten hinzu
 */
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Mischt ein Array (Fisher-Yates Algorithmus)
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Gibt eine zufällige Ganzzahl zwischen min und max zurück (inklusive)
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Wählt einen zufälligen, unbenutzten Prompt aus
 */
function getRandomUnusedPrompt(prompts, usedPrompts) {
  if (!prompts || prompts.length === 0) {
    return null;
  }
  
  const available = prompts.filter(p => !usedPrompts.includes(p));
  if (available.length === 0) {
    // Alle aufgebraucht
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Parst die Timer-Intervalle basierend auf dem Timer-Modus
 */
function parseTimerIntervals(timerMode, intervalString) {
  if (!intervalString) return null;
  
  try {
    switch (timerMode) {
      case 'fixed':
        // Ein einzelner Wert, z.B. "10"
        const fixedValue = parseInt(intervalString.trim(), 10);
        return isNaN(fixedValue) ? null : [fixedValue];
        
      case 'variable':
        // Komma-separierte Werte, z.B. "5,8,10,8"
        return intervalString.split(',').map(v => {
          const num = parseInt(v.trim(), 10);
          return isNaN(num) ? 5 : num; // Fallback auf 5 Minuten
        });
        
      case 'random':
        // Min-Max Range, z.B. "5-12"
        const [min, max] = intervalString.split('-').map(v => parseInt(v.trim(), 10));
        return (!isNaN(min) && !isNaN(max)) ? [min, max] : null;
        
      default:
        return null;
    }
  } catch (error) {
    console.error('Fehler beim Parsen der Timer-Intervalle:', error);
    return null;
  }
}

/**
 * Generiert eine zufällige alphanumerische ID
 */
function generateRandomId(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Ohne I, O, 0, 1 zur Vermeidung von Verwechslungen
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Berechnet die nächste Timer-Dauer basierend auf dem Timer-Modus
 */
function getNextTimerDuration(currentStep, timerMode, intervals) {
  if (!intervals || intervals.length === 0) {
    return 5 * 60; // Fallback: 5 Minuten
  }
  
  switch (timerMode) {
    case 'fixed':
      return intervals[0] * 60; // Sekunden
      
    case 'variable':
      return intervals[currentStep % intervals.length] * 60;
      
    case 'random':
      const [min, max] = intervals; // [5, 12]
      return (min + Math.random() * (max - min)) * 60;
      
    default:
      return 5 * 60; // Fallback: 5 Minuten
  }
}
