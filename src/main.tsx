import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/service-worker-registration";
import { PerformanceMonitor } from "./lib/performance-monitor";

// Mark app start for performance monitoring
PerformanceMonitor.mark("app-start");

// Render app
createRoot(document.getElementById("root")!).render(<App />);

// Mark app render complete
PerformanceMonitor.mark("app-render");

// Register service worker for offline support
registerServiceWorker({
  onSuccess: () => {
    console.log("✅ Service worker registered successfully");
  },
  onUpdate: () => {
    console.log("🔄 New version available");
  },
});

// Log performance metrics after page load
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    setTimeout(() => {
      PerformanceMonitor.mark("app-loaded");

      // Log performance report in development
      if (import.meta.env.DEV) {
        PerformanceMonitor.logReport();
      }
    }, 1000);
  });
}
