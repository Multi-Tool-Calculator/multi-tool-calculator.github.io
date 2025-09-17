const CACHE_VERSION = "v1.0.0"; // bump this when you make changes

const CACHE_NAME = `multi-tool-cache-${CACHE_VERSION}`;
const MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

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

// Helper function to clean up old cache entries based on max age
async function cleanUpCache(cache) {
  const requests = await cache.keys();
  const now = Date.now();

  for (const request of requests) {
    const response = await cache.match(request);
    if (!response) continue;

    const dateHeader = response.headers.get("sw-cache-timestamp");
    if (dateHeader) {
      const cachedTime = Number(dateHeader);
      if (now - cachedTime > MAX_AGE) {
        await cache.delete(request);
      }
    }
  }
}

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Add all assets with a custom header for timestamp
      const cachePromises = ASSETS_TO_CACHE.map(async (url) => {
        const response = await fetch(url);
        if (response.ok) {
          // Clone response and add custom header for timestamp
          const clonedResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
          // Create a new Headers object to add custom header
          const newHeaders = new Headers(clonedResponse.headers);
          newHeaders.set("sw-cache-timestamp", Date.now().toString());
          const responseWithHeader = new Response(clonedResponse.body, {
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers: newHeaders,
          });
          await cache.put(url, responseWithHeader);
        }
      });
      await Promise.all(cachePromises);
    })
  );
});

// Activate and clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cleanUpCache(cache);

      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })()
  );
});

// Fetch handler with cache-first strategy and expiration check
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(async (cachedResponse) => {
      if (cachedResponse) {
        // Check if cached response is expired
        const dateHeader = cachedResponse.headers.get("sw-cache-timestamp");
        if (dateHeader) {
          const cachedTime = Number(dateHeader);
          const now = Date.now();
          if (now - cachedTime > MAX_AGE) {
            // Cache expired, fetch new response
            try {
              const networkResponse = await fetch(event.request);
              if (
                event.request.method === "GET" &&
                networkResponse &&
                networkResponse.status === 200 &&
                networkResponse.type === "basic"
              ) {
                const responseClone = networkResponse.clone();
                // Add timestamp header
                const newHeaders = new Headers(responseClone.headers);
                newHeaders.set("sw-cache-timestamp", Date.now().toString());
                const responseWithHeader = new Response(responseClone.body, {
                  status: responseClone.status,
                  statusText: responseClone.statusText,
                  headers: newHeaders,
                });
                const cache = await caches.open(CACHE_NAME);
                await cache.put(event.request, responseWithHeader);
              }
              return networkResponse;
            } catch (error) {
              // If network fails, return cached response anyway
              return cachedResponse;
            }
          } else {
            // Cache valid, return cached response
            return cachedResponse;
          }
        } else {
          // No timestamp header, return cached response
          return cachedResponse;
        }
      }

      // No cached response, fetch from network and cache it
      try {
        const networkResponse = await fetch(event.request);
        if (
          event.request.method === "GET" &&
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseClone = networkResponse.clone();
          // Add timestamp header
          const newHeaders = new Headers(responseClone.headers);
          newHeaders.set("sw-cache-timestamp", Date.now().toString());
          const responseWithHeader = new Response(responseClone.body, {
            status: responseClone.status,
            statusText: responseClone.statusText,
            headers: newHeaders,
          });
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, responseWithHeader);
        }
        return networkResponse;
      } catch (error) {
        // Optional: fallback page if offline
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      }
    })
  );
});
