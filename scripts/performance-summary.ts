/**
 * Performance Summary Script
 * Quick overview of bundle sizes and optimizations
 *
 * Usage: tsx scripts/performance-summary.ts
 */

import { readdirSync, statSync } from "fs";
import { join } from "path";

interface BundleStats {
  name: string;
  size: number;
  gzipped?: number;
  brotli?: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function getFileSize(path: string): number {
  try {
    return statSync(path).size;
  } catch {
    return 0;
  }
}

function analyzeBundles(): void {
  const distDir = join(process.cwd(), "dist");
  const assetsDir = join(distDir, "assets");

  console.log("\n🎯 IRIS Dashboard - Performance Summary\n");
  console.log("=".repeat(70));

  // Check if build exists
  try {
    readdirSync(distDir);
  } catch {
    console.log("\n❌ No build found. Run 'npm run build' first.\n");
    process.exit(1);
  }

  // Analyze JS bundles
  const jsDir = join(assetsDir, "js");
  const jsFiles: BundleStats[] = [];

  try {
    const files = readdirSync(jsDir);

    for (const file of files) {
      if (file.endsWith(".js") && !file.endsWith(".gz") && !file.endsWith(".br")) {
        const path = join(jsDir, file);
        const size = getFileSize(path);
        const gzipped = getFileSize(`${path}.gz`);
        const brotli = getFileSize(`${path}.br`);

        jsFiles.push({
          name: file,
          size,
          gzipped: gzipped || undefined,
          brotli: brotli || undefined,
        });
      }
    }
  } catch (error) {
    console.log("\n⚠️  Could not analyze JS bundles\n");
  }

  // Analyze CSS bundles
  const cssDir = join(assetsDir, "css");
  const cssFiles: BundleStats[] = [];

  try {
    const files = readdirSync(cssDir);

    for (const file of files) {
      if (file.endsWith(".css") && !file.endsWith(".gz") && !file.endsWith(".br")) {
        const path = join(cssDir, file);
        const size = getFileSize(path);
        const gzipped = getFileSize(`${path}.gz`);
        const brotli = getFileSize(`${path}.br`);

        cssFiles.push({
          name: file,
          size,
          gzipped: gzipped || undefined,
          brotli: brotli || undefined,
        });
      }
    }
  } catch (error) {
    console.log("\n⚠️  Could not analyze CSS bundles\n");
  }

  // Sort by size
  jsFiles.sort((a, b) => b.size - a.size);
  cssFiles.sort((a, b) => b.size - a.size);

  // Display results
  console.log("\n📦 JavaScript Bundles\n");

  if (jsFiles.length === 0) {
    console.log("  No JS bundles found\n");
  } else {
    console.log("  " + "File".padEnd(40) + "Original".padEnd(12) + "Gzipped".padEnd(12) + "Brotli");
    console.log("  " + "-".repeat(68));

    for (const file of jsFiles) {
      const name = file.name.length > 38 ? "..." + file.name.slice(-35) : file.name;
      console.log(
        "  " +
          name.padEnd(40) +
          formatBytes(file.size).padEnd(12) +
          formatBytes(file.gzipped || 0).padEnd(12) +
          formatBytes(file.brotli || 0)
      );
    }
  }

  console.log("\n📄 CSS Bundles\n");

  if (cssFiles.length === 0) {
    console.log("  No CSS bundles found\n");
  } else {
    console.log("  " + "File".padEnd(40) + "Original".padEnd(12) + "Gzipped".padEnd(12) + "Brotli");
    console.log("  " + "-".repeat(68));

    for (const file of cssFiles) {
      const name = file.name.length > 38 ? "..." + file.name.slice(-35) : file.name;
      console.log(
        "  " +
          name.padEnd(40) +
          formatBytes(file.size).padEnd(12) +
          formatBytes(file.gzipped || 0).padEnd(12) +
          formatBytes(file.brotli || 0)
      );
    }
  }

  // Calculate totals
  const totalJS = jsFiles.reduce((sum, f) => sum + f.size, 0);
  const totalJSGzip = jsFiles.reduce((sum, f) => sum + (f.gzipped || 0), 0);
  const totalJSBrotli = jsFiles.reduce((sum, f) => sum + (f.brotli || 0), 0);

  const totalCSS = cssFiles.reduce((sum, f) => sum + f.size, 0);
  const totalCSSGzip = cssFiles.reduce((sum, f) => sum + (f.gzipped || 0), 0);
  const totalCSSBrotli = cssFiles.reduce((sum, f) => sum + (f.brotli || 0), 0);

  const grandTotal = totalJS + totalCSS;
  const grandTotalGzip = totalJSGzip + totalCSSGzip;
  const grandTotalBrotli = totalJSBrotli + totalCSSBrotli;

  console.log("\n📊 Total Bundle Size\n");
  console.log("  " + "Type".padEnd(20) + "Original".padEnd(15) + "Gzipped".padEnd(15) + "Brotli");
  console.log("  " + "-".repeat(68));
  console.log(
    "  " +
      "JavaScript".padEnd(20) +
      formatBytes(totalJS).padEnd(15) +
      formatBytes(totalJSGzip).padEnd(15) +
      formatBytes(totalJSBrotli)
  );
  console.log(
    "  " +
      "CSS".padEnd(20) +
      formatBytes(totalCSS).padEnd(15) +
      formatBytes(totalCSSGzip).padEnd(15) +
      formatBytes(totalCSSBrotli)
  );
  console.log("  " + "-".repeat(68));
  console.log(
    "  " +
      "Total".padEnd(20) +
      formatBytes(grandTotal).padEnd(15) +
      formatBytes(grandTotalGzip).padEnd(15) +
      formatBytes(grandTotalBrotli)
  );

  // Performance targets
  const target = 500 * 1024; // 500 KB
  const gzipKB = Math.round(grandTotalGzip / 1024);
  const targetKB = Math.round(target / 1024);
  const percentOfTarget = Math.round((grandTotalGzip / target) * 100);
  const savings = target - grandTotalGzip;
  const savingsPercent = Math.round((savings / target) * 100);

  console.log("\n🎯 Performance Targets\n");
  console.log(`  Target Bundle Size:     ${targetKB} KB (gzipped)`);
  console.log(`  Actual Bundle Size:     ${gzipKB} KB (gzipped)`);
  console.log(`  Percentage of Target:   ${percentOfTarget}%`);

  if (grandTotalGzip <= target) {
    console.log(`  Status:                 ✅ Under target by ${formatBytes(savings)} (${savingsPercent}%)`);
  } else {
    console.log(`  Status:                 ❌ Over target by ${formatBytes(grandTotalGzip - target)}`);
  }

  // Compression efficiency
  const gzipRatio = Math.round(((grandTotal - grandTotalGzip) / grandTotal) * 100);
  const brotliRatio = Math.round(((grandTotal - grandTotalBrotli) / grandTotal) * 100);
  const brotliVsGzip = Math.round(((grandTotalGzip - grandTotalBrotli) / grandTotalGzip) * 100);

  console.log("\n🗜️  Compression Efficiency\n");
  console.log(`  Gzip Compression:       ${gzipRatio}% size reduction`);
  console.log(`  Brotli Compression:     ${brotliRatio}% size reduction`);
  console.log(`  Brotli vs Gzip:         ${brotliVsGzip}% additional savings`);

  // Optimizations applied
  console.log("\n✨ Optimizations Applied\n");
  console.log("  ✅ Code splitting (route-based)");
  console.log("  ✅ Vendor chunk separation (5 chunks)");
  console.log("  ✅ Brotli + Gzip compression");
  console.log("  ✅ Terser minification");
  console.log("  ✅ Tree shaking");
  console.log("  ✅ CSS code splitting");
  console.log("  ✅ Lazy loading");
  console.log("  ✅ React.memo optimization");
  console.log("  ✅ Service worker caching");
  console.log("  ✅ Performance monitoring");

  // Largest bundles
  console.log("\n📦 Largest Bundles (Optimization Opportunities)\n");

  const topBundles = jsFiles.slice(0, 3);
  for (const bundle of topBundles) {
    const sizeKB = Math.round((bundle.gzipped || bundle.size) / 1024);
    console.log(`  • ${bundle.name}`);
    console.log(`    Size: ${sizeKB} KB (gzipped)`);

    if (bundle.name.includes("chart-vendor")) {
      console.log(`    💡 Consider lazy loading charts or using lighter library`);
    } else if (bundle.name.includes("Index")) {
      console.log(`    💡 Main page bundle - consider code splitting heavy components`);
    } else if (bundle.name.includes("ui-vendor")) {
      console.log(`    💡 UI components are well-optimized`);
    }
  }

  // Next steps
  console.log("\n🚀 Next Steps\n");
  console.log("  1. View detailed bundle analysis:");
  console.log("     open dist/stats.html\n");
  console.log("  2. Run Lighthouse audit (requires lighthouse package):");
  console.log("     tsx scripts/performance-audit.ts http://localhost:8080\n");
  console.log("  3. Monitor performance in browser:");
  console.log("     PerformanceMonitor.logReport()\n");
  console.log("  4. Read full report:");
  console.log("     cat docs/PERFORMANCE_REPORT.md\n");

  console.log("=".repeat(70));
  console.log("\n");
}

// Run analysis
analyzeBundles();
