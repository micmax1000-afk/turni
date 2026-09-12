/* Turni & Accessorio PS — Service Worker V48 */
'use strict';
const CACHE='turni-ps-v48';
const BASE='/turni/';
const APP_SHELL=[
  BASE, BASE+'index.html', BASE+'manifest.json', BASE+'style.css', BASE+'script.js',
  BASE+'js/config.js', BASE+'js/state.js', BASE+'js/storage.js', BASE+'js/utils.js',
  BASE+'js/shifts.js', BASE+'js/absences.js', BASE+'js/calendar.js', BASE+'js/sequence.js',
  BASE+'js/payroll.js', BASE+'js/tables.js', BASE+'js/profile.js', BASE+'js/backup.js',
  BASE+'js/ui.js', BASE+'js/dashboard.js', BASE+'js/statistics.js', BASE+'js/offline.js',
  BASE+'js/migrations.js', BASE+'js/data-guard.js', BASE+'js/data/tabelle-2026.js',
  BASE+'icons/icon-48.png', BASE+'icons/icon-72.png', BASE+'icons/icon-96.png',
  BASE+'icons/icon-128.png', BASE+'icons/icon-144.png', BASE+'icons/icon-152.png',
  BASE+'icons/icon-192.png', BASE+'icons/icon-384.png', BASE+'icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  if(new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if(cached) return cached;
      return fetch(request).then(response => {
        if(response.ok){
          caches.open(CACHE).then(cache => cache.put(request, response.clone())).catch(() => {});
        }
        return response;
      }).catch(() => caches.match(BASE+'index.html'));
    })
  );
});

self.addEventListener('push', event => {
  const dati = event.data ? (() => { try { return event.data.json(); } catch { return {}; } })() : {};
  const titolo = dati.title || 'Turni & Accessorio PS';
  const opzioni = {
    body: dati.body || 'Hai una nuova notifica.',
    icon: BASE+'icons/icon-192.png',
    badge: BASE+'icons/icon-96.png'
  };
  event.waitUntil(self.registration.showNotification(titolo, opzioni));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(BASE+'index.html'));
});

self.addEventListener('sync', event => {
  // Placeholder per future sync
});
