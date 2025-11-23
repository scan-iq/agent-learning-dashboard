# Performance Optimization Quick Start

## Overview

The IRIS Dashboard has been optimized for maximum performance. This guide helps you understand and maintain these optimizations.

## Quick Stats

- **Bundle Size:** 299 KB gzipped (40% under 500KB target)
- **Compression:** 77% reduction with gzip, 81% with brotli
- **Code Splitting:** 5 vendor chunks + lazy-loaded routes
- **Expected FCP:** <1s (target: <1.5s)
- **Expected TTI:** ~2.1s (target: <3.5s)

## Running Performance Checks

### 1. View Bundle Analysis

```bash
# Build project
npm run build

# View bundle visualization
open dist/stats.html
```

### 2. Quick Performance Summary

```bash
# View bundle sizes and compression stats
npx tsx scripts/performance-summary.ts
```

### 3. Lighthouse Audit

```bash
# Start production server
npm run build
npm run preview

# Run Lighthouse (requires: npm install -D lighthouse chrome-launcher)
npx tsx scripts/performance-audit.ts http://localhost:4173

# Or use Chrome DevTools:
# 1. Open http://localhost:4173
# 2. Press F12
# 3. Go to Lighthouse tab
# 4. Click "Generate report"
```

### 4. Monitor in Browser

Open browser console and run:
```javascript
PerformanceMonitor.logReport();
```

## Key Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build optimizations, code splitting, compression |
| `src/App.tsx` | Lazy loading, route splitting |
| `src/main.tsx` | Performance monitoring, service worker registration |
| `src/lib/performance-monitor.ts` | Web Vitals tracking |
| `src/lib/service-worker-registration.ts` | SW management |
| `public/sw.js` | Offline caching |
| `scripts/performance-audit.ts` | Lighthouse automation |
| `scripts/performance-summary.ts` | Bundle analysis |

## Optimizations Applied

### Build Level
- ✅ Vendor chunk separation (react, ui, charts, query, date)
- ✅ Brotli + Gzip compression
- ✅ Terser minification (removes console.log)
- ✅ Tree shaking
- ✅ CSS code splitting

### Code Level
- ✅ Route-based lazy loading
- ✅ React.memo on expensive components
- ✅ useCallback/useMemo for optimization
- ✅ React Query caching (5min stale time)

### Runtime
- ✅ Service worker (offline-first)
- ✅ Performance monitoring (Web Vitals)
- ✅ Cache-first for static assets
- ✅ Network-first for API calls

## Maintaining Performance

### Before Committing

```bash
# Check bundle size
npm run build
npx tsx scripts/performance-summary.ts

# Ensure gzipped total < 500 KB
```

### When Adding Dependencies

```bash
# Check package size before installing
npx bundle-phobia [package-name]

# Example:
npx bundle-phobia lodash
# ❌ 72.5 KB (too large)

npx bundle-phobia lodash-es
# ✅ 24.3 KB (tree-shakeable)
```

### Component Optimization

```tsx
// ✅ Memoize expensive components
export const MyComponent = memo(function MyComponent({ data }) {
  // Use useCallback for event handlers
  const handleClick = useCallback(() => {
    // handler logic
  }, []);

  // Use useMemo for computed values
  const processedData = useMemo(() => {
    return expensiveComputation(data);
  }, [data]);

  return <div>{/* render */}</div>;
});
```

### Lazy Loading

```tsx
// ✅ Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));

// Use with Suspense
<Suspense fallback={<Spinner />}>
  <HeavyChart />
</Suspense>
```

## Troubleshooting

### Bundle Too Large?

1. Check bundle analysis: `open dist/stats.html`
2. Identify large dependencies
3. Consider alternatives or lazy loading
4. Use dynamic imports for non-critical code

### Slow Performance?

1. Run: `PerformanceMonitor.logReport()`
2. Check for:
   - Unnecessary re-renders (use React DevTools Profiler)
   - Large components without React.memo
   - Missing useCallback/useMemo
   - Slow API calls (check Network tab)

### Service Worker Issues?

```javascript
// Clear cache and unregister
await clearServiceWorkerCache();
await unregisterServiceWorker();

// Refresh page
window.location.reload();
```

## Performance Budget

**Maximum allowed sizes:**

| Asset Type | Limit (gzipped) |
|------------|----------------|
| JavaScript | 350 KB |
| CSS | 15 KB |
| Images | 50 KB |
| **Total** | **450 KB** |

**Timing budgets:**

| Metric | Target |
|--------|--------|
| First Contentful Paint | <1.5s |
| Time to Interactive | <3.5s |
| Largest Contentful Paint | <2.5s |

## Resources

- **Full Report:** `docs/PERFORMANCE_REPORT.md`
- **Bundle Analysis:** `dist/stats.html` (after build)
- **Web Vitals:** https://web.dev/vitals/
- **Vite Optimization:** https://vitejs.dev/guide/performance.html

## Common Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview

# Bundle analysis
npx tsx scripts/performance-summary.ts

# Lighthouse audit
npx tsx scripts/performance-audit.ts http://localhost:4173
```

## Support

For performance issues or questions:
1. Check `docs/PERFORMANCE_REPORT.md`
2. Run performance summary script
3. Review bundle analysis
4. Check browser console for PerformanceMonitor logs
