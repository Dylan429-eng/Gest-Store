const CACHE_NAME = 'atelier-boutique-v2';

// Uniquement des fichiers statiques et sans données financières :
// on ne met JAMAIS en cache le dashboard, ventes, dépenses, etc.
// pour ne jamais afficher un bénéfice ou un solde périmé.
const APP_SHELL = [
  '/manifest.json',
  '/css/style.css',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Navigation (chargement d'une page) : toujours essayer le réseau
  // d'abord (données à jour) ; si hors-ligne, afficher offline.html.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Fichiers statiques connus (app shell) : réseau d'abord pour garantir
  // la fraîcheur du CSS, puis cache en secours hors-ligne.
  if (url.origin === self.location.origin && APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Tout le reste (formulaires POST, requêtes vers Supabase, etc.) :
  // réseau uniquement, jamais intercepté.
});
