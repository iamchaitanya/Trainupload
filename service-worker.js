const CACHE_NAME = 'bank-inspector-cache-v1';
const urlsToCache = [
  '/Trainupload/',
  '/Trainupload/index.html',
  '/Trainupload/style.css',
  '/Trainupload/app.js',
  '/Trainupload/icons/icon-192x192.png',
  '/Trainupload/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
