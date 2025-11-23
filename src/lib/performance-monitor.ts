/**
 * Performance Monitoring Utilities for IRIS Dashboard
 * Tracks FCP, TTI, LCP, bundle size, and component render times
 */

export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  tti?: number; // Time to Interactive
}

export interface ComponentMetrics {
  name: string;
  renderTime: number;
  timestamp: number;
}

class PerformanceMonitorClass {
  private metrics: PerformanceMetrics = {};
  private componentMetrics: ComponentMetrics[] = [];
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeObservers();
    }
  }

  /**
   * Initialize Performance Observers for Web Vitals
   */
  private initializeObservers() {
    try {
      // Observe Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

      // Observe First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
          this.metrics.fid = entry.processingStart
            ? entry.processingStart - entry.startTime
            : 0;
        });
      });
      fidObserver.observe({ type: "first-input", buffered: true });

      // Observe Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<
          PerformanceEntry & { value?: number; hadRecentInput?: boolean }
        >) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value || 0;
            this.metrics.cls = clsValue;
          }
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });

      this.observer = lcpObserver;
    } catch (error) {
      console.warn("Performance Observer not supported:", error);
    }
  }

  /**
   * Measure First Contentful Paint (FCP)
   */
  measureFCP(): number | undefined {
    try {
      const paintEntries = performance.getEntriesByType("paint");
      const fcpEntry = paintEntries.find((entry) => entry.name === "first-contentful-paint");
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        return fcpEntry.startTime;
      }
    } catch (error) {
      console.warn("Failed to measure FCP:", error);
    }
    return undefined;
  }

  /**
   * Measure Time to Interactive (TTI)
   * Simplified estimation based on FCP and long tasks
   */
  measureTTI(): number | undefined {
    try {
      const fcp = this.measureFCP();
      if (!fcp) return undefined;

      // Simple estimation: TTI is typically FCP + time for main thread to be idle
      const navTiming = performance.getEntriesByType("navigation")[0] as
        | (PerformanceNavigationTiming & { domInteractive?: number })
        | undefined;
      if (navTiming?.domInteractive) {
        this.metrics.tti = navTiming.domInteractive;
        return navTiming.domInteractive;
      }
    } catch (error) {
      console.warn("Failed to measure TTI:", error);
    }
    return undefined;
  }

  /**
   * Measure Time to First Byte (TTFB)
   */
  measureTTFB(): number | undefined {
    try {
      const navTiming = performance.getEntriesByType("navigation")[0] as
        | (PerformanceNavigationTiming & { responseStart?: number })
        | undefined;
      if (navTiming?.responseStart) {
        this.metrics.ttfb = navTiming.responseStart;
        return navTiming.responseStart;
      }
    } catch (error) {
      console.warn("Failed to measure TTFB:", error);
    }
    return undefined;
  }

  /**
   * Measure component render time
   */
  measureRender(componentName: string, fn: () => void): void {
    const start = performance.now();
    fn();
    const end = performance.now();
    const renderTime = end - start;

    this.componentMetrics.push({
      name: componentName,
      renderTime,
      timestamp: Date.now(),
    });

    if (import.meta.env.DEV) {
      console.log(`[Performance] ${componentName} render: ${renderTime.toFixed(2)}ms`);
    }
  }

  /**
   * Measure async operation
   */
  async measureAsync<T>(
    operationName: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;

    if (import.meta.env.DEV) {
      console.log(`[Performance] ${operationName}: ${duration.toFixed(2)}ms`);
    }

    return { result, duration };
  }

  /**
   * Get current bundle size estimation
   */
  measureBundleSize(): { js: number; css: number; total: number } {
    try {
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      let jsSize = 0;
      let cssSize = 0;

      resources.forEach((resource) => {
        if (resource.name.endsWith(".js")) {
          jsSize += resource.transferSize || 0;
        } else if (resource.name.endsWith(".css")) {
          cssSize += resource.transferSize || 0;
        }
      });

      return {
        js: Math.round(jsSize / 1024), // KB
        css: Math.round(cssSize / 1024), // KB
        total: Math.round((jsSize + cssSize) / 1024), // KB
      };
    } catch (error) {
      console.warn("Failed to measure bundle size:", error);
      return { js: 0, css: 0, total: 0 };
    }
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): PerformanceMetrics {
    return {
      fcp: this.measureFCP(),
      ttfb: this.measureTTFB(),
      tti: this.measureTTI(),
      lcp: this.metrics.lcp,
      fid: this.metrics.fid,
      cls: this.metrics.cls,
    };
  }

  /**
   * Get component render metrics
   */
  getComponentMetrics(): ComponentMetrics[] {
    return [...this.componentMetrics];
  }

  /**
   * Log performance report to console
   */
  logReport(): void {
    const metrics = this.getAllMetrics();
    const bundleSize = this.measureBundleSize();

    console.group("📊 Performance Report");
    console.log("Web Vitals:");
    console.table({
      "First Contentful Paint (FCP)": metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : "N/A",
      "Largest Contentful Paint (LCP)": metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : "N/A",
      "First Input Delay (FID)": metrics.fid ? `${metrics.fid.toFixed(0)}ms` : "N/A",
      "Cumulative Layout Shift (CLS)": metrics.cls ? metrics.cls.toFixed(3) : "N/A",
      "Time to First Byte (TTFB)": metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : "N/A",
      "Time to Interactive (TTI)": metrics.tti ? `${metrics.tti.toFixed(0)}ms` : "N/A",
    });

    console.log("\nBundle Size:");
    console.table({
      JavaScript: `${bundleSize.js}KB`,
      CSS: `${bundleSize.css}KB`,
      Total: `${bundleSize.total}KB`,
    });

    if (this.componentMetrics.length > 0) {
      console.log("\nSlowest Components:");
      const slowest = [...this.componentMetrics]
        .sort((a, b) => b.renderTime - a.renderTime)
        .slice(0, 10);
      console.table(
        slowest.map((m) => ({
          Component: m.name,
          "Render Time": `${m.renderTime.toFixed(2)}ms`,
        }))
      );
    }

    console.groupEnd();
  }

  /**
   * Mark a custom performance mark
   */
  mark(name: string): void {
    try {
      performance.mark(name);
    } catch (error) {
      console.warn(`Failed to create mark ${name}:`, error);
    }
  }

  /**
   * Measure between two marks
   */
  measure(name: string, startMark: string, endMark: string): number | undefined {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, "measure")[0];
      return measure?.duration;
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
      return undefined;
    }
  }

  /**
   * Clear all performance data
   */
  clear(): void {
    this.componentMetrics = [];
    try {
      performance.clearMarks();
      performance.clearMeasures();
    } catch (error) {
      console.warn("Failed to clear performance data:", error);
    }
  }
}

// Export singleton instance
export const PerformanceMonitor = new PerformanceMonitorClass();

/**
 * React Hook for measuring component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  if (import.meta.env.DEV) {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`[Performance] ${componentName}: ${(end - start).toFixed(2)}ms`);
    };
  }
  return () => {}; // No-op in production
}

/**
 * Performance tracking decorator for React components
 * Note: Use React.memo or manual performance monitoring in components
 * This is a placeholder for advanced HOC implementations
 */
export function trackComponentPerformance(componentName: string): void {
  if (import.meta.env.DEV) {
    console.log(`[Performance] Tracking enabled for: ${componentName}`);
  }
}
