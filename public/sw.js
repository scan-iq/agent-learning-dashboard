/**
 * Service Worker for IRIS Dashboard
 * Implements offline-first strategy with caching
 */

const CACHE_NAME = "iris-dashboard-v1";
const RUNTIME_CACHE = "iris-runtime-v1";
const API_CACHE = "iris-api-v1";

// Static assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error("[Service Worker] Failed to cache static assets:", err);
      });
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== RUNTIME_CACHE &&
            cacheName !== API_CACHE
          ) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // API requests - Network First with API cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      networkFirstStrategy(request, API_CACHE, 5000) // 5s timeout
    );
    return;
  }

  // Static assets - Cache First
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE));
    return;
  }

  // HTML pages - Network First with Runtime cache fallback
  if (
    request.headers.get("accept")?.includes("text/html") ||
    url.pathname === "/"
  ) {
    event.respondWith(
      networkFirstStrategy(request, RUNTIME_CACHE, 3000) // 3s timeout
    );
    return;
  }

  // Default - Network First
  event.respondWith(
    networkFirstStrategy(request, RUNTIME_CACHE, 3000)
  );
});

/**
 * Cache First Strategy
 * Try cache first, fall back to network
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Return cached response and update cache in background
      updateCacheInBackground(request, cache);
      return cachedResponse;
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[Service Worker] Cache first strategy failed:", error);
    return createErrorResponse("Network request failed");
  }
}

/**
 * Network First Strategy (with timeout)
 * Try network first with timeout, fall back to cache
 */
async function networkFirstStrategy(request, cacheName, timeout = 5000) {
  try {
    const cache = await caches.open(cacheName);

    // Race between network request and timeout
    const networkPromise = fetch(request).then((response) => {
      // Clone response for caching
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Network timeout")), timeout)
    );

    try {
      return await Promise.race([networkPromise, timeoutPromise]);
    } catch (error) {
      // Network failed or timeout - try cache
      console.log("[Service Worker] Network failed, trying cache:", error.message);
      const cachedResponse = await cache.match(request);

      if (cachedResponse) {
        return cachedResponse;
      }

      // No cache available
      throw error;
    }
  } catch (error) {
    console.error("[Service Worker] Network first strategy failed:", error);

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return createOfflinePage();
    }

    return createErrorResponse("Request failed and no cache available");
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cache immediately, update cache in background
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // Always fetch from network to update cache
    const networkPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    });

    // Return cached response immediately if available
    return cachedResponse || (await networkPromise);
  } catch (error) {
    console.error("[Service Worker] Stale while revalidate failed:", error);
    return createErrorResponse("Request failed");
  }
}

/**
 * Update cache in background (fire and forget)
 */
function updateCacheInBackground(request, cache) {
  fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    })
    .catch((error) => {
      console.log("[Service Worker] Background cache update failed:", error);
    });
}

/**
 * Create offline fallback page
 */
function createOfflinePage() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - IRIS Dashboard</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: #0a0a0a;
          color: #fff;
        }
        .container {
          text-align: center;
          padding: 2rem;
        }
        h1 {
          font-size: 3rem;
          margin: 0 0 1rem;
        }
        p {
          font-size: 1.2rem;
          color: #888;
          margin: 0 0 2rem;
        }
        button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
        }
        button:hover {
          background: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📡 Offline</h1>
        <p>You are currently offline. Please check your internet connection.</p>
        <button onclick="window.location.reload()">Retry</button>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    status: 503,
    statusText: "Service Unavailable",
    headers: new Headers({
      "Content-Type": "text/html",
    }),
  });
}

/**
 * Create error response
 */
function createErrorResponse(message) {
  return new Response(JSON.stringify({ error: message }), {
    status: 503,
    statusText: "Service Unavailable",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
}

// Listen for messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_URLS") {
    const urls = event.data.urls;
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(urls);
    });
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    });
  }
});

console.log("[Service Worker] Loaded successfully");
