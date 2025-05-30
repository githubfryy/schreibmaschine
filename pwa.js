/**
 * Schreibmaschine - PWA Service Worker Registrierung
 */

// Service Worker registrieren, wenn er vom Browser unterstützt wird
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('Service Worker registriert mit Scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker Registrierung fehlgeschlagen:', error);
      });
  });
}
