/**
 * Service Worker Registration and Management
 * Handles registration, updates, and lifecycle events
 */

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(config?: ServiceWorkerConfig): Promise<void> {
  // Only register in production and if service worker is supported
  if (import.meta.env.DEV || !("serviceWorker" in navigator)) {
    console.log("[SW] Service worker not registered (dev mode or unsupported)");
    return;
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log("[SW] Service worker registered:", registration.scope);

    // Check for updates on page load
    registration.update();

    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // New service worker available
          console.log("[SW] New version available!");
          config?.onUpdate?.(registration);

          // Show update notification
          if (confirm("New version available! Reload to update?")) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
            window.location.reload();
          }
        } else if (newWorker.state === "activated") {
          config?.onSuccess?.(registration);
        }
      });
    });

    // Handle offline/online events
    window.addEventListener("offline", () => {
      console.log("[SW] App is offline");
      config?.onOffline?.();
    });

    window.addEventListener("online", () => {
      console.log("[SW] App is back online");
      config?.onOnline?.();
    });

    // Listen for controlling service worker changes
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  } catch (error) {
    console.error("[SW] Service worker registration failed:", error);
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    console.log("[SW] Service worker unregistered:", success);
    return success;
  } catch (error) {
    console.error("[SW] Service worker unregistration failed:", error);
    return false;
  }
}

/**
 * Clear all service worker caches
 */
export async function clearServiceWorkerCache(): Promise<void> {
  if (!("caches" in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    console.log("[SW] All caches cleared");
  } catch (error) {
    console.error("[SW] Failed to clear caches:", error);
  }
}

/**
 * Check if service worker is registered
 */
export function isServiceWorkerRegistered(): boolean {
  return "serviceWorker" in navigator && !!navigator.serviceWorker.controller;
}

/**
 * Get service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<
  ServiceWorkerRegistration | undefined
> {
  if (!("serviceWorker" in navigator)) {
    return undefined;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error("[SW] Failed to get registration:", error);
    return undefined;
  }
}

/**
 * Send message to service worker
 */
export async function sendMessageToServiceWorker(message: unknown): Promise<void> {
  const registration = await getServiceWorkerRegistration();
  if (!registration?.active) {
    console.warn("[SW] No active service worker to send message to");
    return;
  }

  registration.active.postMessage(message);
}

/**
 * Prefetch URLs in service worker cache
 */
export async function prefetchUrls(urls: string[]): Promise<void> {
  await sendMessageToServiceWorker({
    type: "CACHE_URLS",
    urls,
  });
}
