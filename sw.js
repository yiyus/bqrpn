const app = "bqrpn-v0";
const assets = [
  "/",
  "/index.html",
  "/style.css",
  "/rpn.js"
];

self.addEventListener("install", ev => ev.waitUntil(caches.open(app).then(c => c.addAll(assets))));
self.addEventListener("fetch", ev => ev.respondWith(caches.match(ev.request).then(r => r || fetch(ev.request))));
