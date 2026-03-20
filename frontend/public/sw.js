var CACHE = 'lumina-v2';
var STATIC = ['/', '/index.html', '/manifest.json', '/icons/icon-192x192.png', '/icons/icon-512x512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(STATIC); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // API e Supabase: sempre busca na rede
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('railway.app') ||
      url.hostname.includes('supabase.co') ||
      url.hostname.includes('googleapis.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Estáticos: cache first
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return response;
      }).catch(function() {
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
