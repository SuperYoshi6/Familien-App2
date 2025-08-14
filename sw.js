// sw.js — einfacher Cache & Network-Fallback
const CACHE_NAME = 'familie-pwa-v1';
const ASSETS = ['/', './index.html'];
self.addEventListener('install', e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate', e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch', event=>{ if(event.request.method!=='GET') return; event.respondWith(caches.match(event.request).then(r=> r || fetch(event.request).then(fr=>{ if(!fr || fr.status!==200 || fr.type!=='basic') return fr; const copy=fr.clone(); caches.open(CACHE_NAME).then(c=>c.put(event.request, copy)); return fr; }))) });