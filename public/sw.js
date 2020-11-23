var cacheName = "hello-pwa";
var filesToCache = ["/", "index.html", "css/style.css", "javascript/app.js"];
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(filesToCache);
    })
  );
});
/* Serve cached content when offline */
self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    // Try the cache
    caches
      .match(event.request)
      .then(function (response) {
        console.log("[service worker] attempting to fetch file from cache...");
        return response || fetch(event.request);
      })
      .catch(function () {
        // If both fail, show a generic fallback:
        return caches.match(offlineFallbackPage);
      })
  );
});
