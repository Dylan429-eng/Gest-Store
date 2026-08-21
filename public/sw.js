const CACHE_NAME = 'atelier-boutique-v1';

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

  // Navigation (chargement d'une page) : toujours essayer le réseau
  // d'abord (données à jour) ; si hors-ligne, afficher offline.html.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Fichiers statiques connus (app shell) : cache d'abord pour la rapidité.
  const url = new URL(request.url);
  if (url.origin === self.location.origin && APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Tout le reste (formulaires POST, requêtes vers Supabase, etc.) :
  // réseau uniquement, jamais intercepté.
});
