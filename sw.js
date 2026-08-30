/* Turni & Accessorio PS — Service Worker V40 */
'use strict';
const CACHE='turni-ps-v46';
const APP_SHELL=[
 './','./index.html','./manifest.json','./style.css','./script.js',
 './js/config.js','./js/state.js','./js/storage.js','./js/utils.js','./js/shifts.js','./js/absences.js','./js/calendar.js','./js/sequence.js','./js/payroll.js','./js/tables.js','./js/profile.js','./js/backup.js','./js/ui.js','./js/dashboard.js','./js/statistics.js','./js/offline.js','./js/migrations.js','./js/data-guard.js','./js/data/tabelle-2026.js','./icons/icon-192.png','./icons/icon-512.png'
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
      }).catch(() => caches.match('./index.html'));
    })
  );
});
