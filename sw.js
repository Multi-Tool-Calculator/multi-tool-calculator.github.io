// sw.js
const CACHE_NAME = "mtc-cache-v1"; // change version when files update
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/components.js",
  "/js/utils.js",
  "/js/percentage.js",
  "/js/age.js",
  "/js/sip.js",
  "/js/tax.js",
  "/js/gold.js",
  "/js/emi.js",
  "/js/bmi.js",
  "/js/gst.js",
  "/js/fuel.js",
  "/js/discount.js",
  // add other pages/assets if needed
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate and clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
});

// Fetch handler with cache-first strategy
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response; // return from cache
      return fetch(event.request).then((networkResponse) => {
        // Cache new requests (only GET, not POST)
        if (event.request.method === "GET") {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
    })
  );
});
