// Schreibmaschine Service Worker
const CACHE_NAME = 'schreibmaschine-cache-v1';

// Dateien, die zwischengespeichert werden sollen
const FILES_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './style.css',
  './app.js',
  './admin.js',
  './shared.js',
  './libs/marked.min.js',
  './manifest.json',
  './favicon.ico',
  './404.html',
  './prompts/default.md',
  './prompts/romantik.md',
  './prompts/mystery.md'
];

// Service Worker installieren
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache geöffnet');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Alte Caches löschen
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheToDelete) => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch-Interceptor - Cache-First-Strategie
self.addEventListener('fetch', (event) => {
  // Nur GET-Anfragen abfangen
  if (event.request.method !== 'GET') return;
  
  // Ignoriere Chrome-Erweiterungs-Anfragen
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache-Hit - Datei aus dem Cache zurückgeben
        if (response) {
          return response;
        }
        
        // Cache-Miss - Datei vom Netzwerk holen
        return fetch(event.request)
          .then((response) => {
            // Prüfen, ob gültige Antwort
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Kopie der Antwort erstellen und in den Cache legen
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Nur wichtige Ressourcen cachen, keine externen URLs
                if (event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          });
      })
      .catch(() => {
        // Bei Netzwerkfehlern eine Offline-Fallback-Seite anzeigen
        if (event.request.mode === 'navigate') {
          return caches.match('./404.html');
        }
        
        // Für andere Ressourcen einfach einen Fehler zurückgeben
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});
