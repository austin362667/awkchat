self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install');
  });
  self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
  });
  self.addEventListener('fetch', event => {
    console.log('[ServiceWorker] fetch', event.request);
  });