/**
 * Performance Audit Script for IRIS Dashboard
 * Runs Lighthouse audits and generates performance reports
 *
 * Prerequisites:
 * npm install -D lighthouse chrome-launcher
 *
 * Usage:
 * tsx scripts/performance-audit.ts [url]
 *
 * Example:
 * tsx scripts/performance-audit.ts http://localhost:8080
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

interface LighthouseResult {
  lhr: {
    categories: {
      performance: { score: number };
      accessibility: { score: number };
      "best-practices": { score: number };
      seo: { score: number };
    };
    audits: {
      [key: string]: {
        score: number | null;
        displayValue?: string;
        numericValue?: number;
      };
    };
  };
  report: string;
}

interface PerformanceMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  speedIndex: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
}

async function runLighthouseAudit(url: string): Promise<void> {
  console.log("🚀 Starting Performance Audit...");
  console.log(`📊 Target URL: ${url}`);
  console.log("");

  try {
    // Dynamic import to handle optional dependency
    let lighthouse: typeof import("lighthouse").default;
    let chromeLauncher: typeof import("chrome-launcher");

    try {
      lighthouse = (await import("lighthouse")).default;
      chromeLauncher = await import("chrome-launcher");
    } catch (error) {
      console.error("❌ Lighthouse dependencies not found!");
      console.log("");
      console.log("📦 Install required packages:");
      console.log("   npm install -D lighthouse chrome-launcher");
      console.log("");
      console.log("📖 Alternative: Use Lighthouse CLI");
      console.log("   npx lighthouse", url, "--view");
      console.log("");
      console.log("🌐 Or use Chrome DevTools:");
      console.log("   1. Open Chrome DevTools (F12)");
      console.log("   2. Go to Lighthouse tab");
      console.log("   3. Click 'Generate report'");
      process.exit(1);
    }

    // Launch Chrome
    console.log("🌐 Launching Chrome...");
    const chrome = await chromeLauncher.launch({
      chromeFlags: ["--headless", "--disable-gpu", "--no-sandbox"],
    });

    console.log("📝 Running Lighthouse audit...");
    console.log("   This may take 30-60 seconds...");

    // Lighthouse configuration
    const options = {
      logLevel: "error" as const,
      output: "html" as const,
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      port: chrome.port,
    };

    // Run Lighthouse
    const runnerResult = await lighthouse(url, options) as unknown as LighthouseResult;

    if (!runnerResult) {
      throw new Error("Failed to get Lighthouse results");
    }

    // Extract scores
    const categories = runnerResult.lhr.categories;
    const audits = runnerResult.lhr.audits;

    const metrics: PerformanceMetrics = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories["best-practices"].score * 100),
      seo: Math.round(categories.seo.score * 100),
      firstContentfulPaint: audits["first-contentful-paint"]?.numericValue || 0,
      largestContentfulPaint: audits["largest-contentful-paint"]?.numericValue || 0,
      timeToInteractive: audits["interactive"]?.numericValue || 0,
      speedIndex: audits["speed-index"]?.numericValue || 0,
      totalBlockingTime: audits["total-blocking-time"]?.numericValue || 0,
      cumulativeLayoutShift: audits["cumulative-layout-shift"]?.numericValue || 0,
    };

    // Display results
    console.log("");
    console.log("📊 Lighthouse Audit Results");
    console.log("=".repeat(50));
    console.log("");

    displayScore("Performance", metrics.performance);
    displayScore("Accessibility", metrics.accessibility);
    displayScore("Best Practices", metrics.bestPractices);
    displayScore("SEO", metrics.seo);

    console.log("");
    console.log("⚡ Performance Metrics");
    console.log("=".repeat(50));
    console.log(`  First Contentful Paint: ${formatMs(metrics.firstContentfulPaint)}`);
    console.log(`  Largest Contentful Paint: ${formatMs(metrics.largestContentfulPaint)}`);
    console.log(`  Time to Interactive: ${formatMs(metrics.timeToInteractive)}`);
    console.log(`  Speed Index: ${formatMs(metrics.speedIndex)}`);
    console.log(`  Total Blocking Time: ${formatMs(metrics.totalBlockingTime)}`);
    console.log(`  Cumulative Layout Shift: ${metrics.cumulativeLayoutShift.toFixed(3)}`);
    console.log("");

    // Performance analysis
    analyzePerformance(metrics);

    // Save HTML report
    const reportsDir = join(process.cwd(), "reports");
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = join(reportsDir, `lighthouse-${timestamp}.html`);
    writeFileSync(reportPath, runnerResult.report);

    console.log(`📄 Full report saved: ${reportPath}`);

    // Save JSON metrics
    const metricsPath = join(reportsDir, `metrics-${timestamp}.json`);
    writeFileSync(
      metricsPath,
      JSON.stringify(
        {
          url,
          timestamp: new Date().toISOString(),
          scores: {
            performance: metrics.performance,
            accessibility: metrics.accessibility,
            bestPractices: metrics.bestPractices,
            seo: metrics.seo,
          },
          metrics: {
            fcp: metrics.firstContentfulPaint,
            lcp: metrics.largestContentfulPaint,
            tti: metrics.timeToInteractive,
            si: metrics.speedIndex,
            tbt: metrics.totalBlockingTime,
            cls: metrics.cumulativeLayoutShift,
          },
        },
        null,
        2
      )
    );

    console.log(`📊 Metrics saved: ${metricsPath}`);
    console.log("");

    // Close Chrome
    await chrome.kill();

    // Exit with error if performance is below threshold
    if (metrics.performance < 90) {
      console.log("⚠️  Performance score below 90. Consider optimizing.");
      process.exit(1);
    }

    console.log("✅ Audit completed successfully!");
  } catch (error) {
    console.error("❌ Audit failed:", error);
    process.exit(1);
  }
}

function displayScore(name: string, score: number): void {
  const emoji = score >= 90 ? "✅" : score >= 50 ? "⚠️" : "❌";
  const color = score >= 90 ? "green" : score >= 50 ? "yellow" : "red";
  console.log(`  ${emoji} ${name}: ${score}/100`);
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function analyzePerformance(metrics: PerformanceMetrics): void {
  console.log("🔍 Performance Analysis");
  console.log("=".repeat(50));

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check FCP
  if (metrics.firstContentfulPaint > 1800) {
    issues.push("⚠️  First Contentful Paint is slow (>1.8s)");
    recommendations.push("   • Reduce render-blocking resources");
    recommendations.push("   • Optimize server response time");
    recommendations.push("   • Use resource hints (preload, prefetch)");
  }

  // Check LCP
  if (metrics.largestContentfulPaint > 2500) {
    issues.push("⚠️  Largest Contentful Paint is slow (>2.5s)");
    recommendations.push("   • Optimize images (WebP, lazy loading)");
    recommendations.push("   • Reduce CSS/JS bundle size");
    recommendations.push("   • Use CDN for static assets");
  }

  // Check TTI
  if (metrics.timeToInteractive > 3800) {
    issues.push("⚠️  Time to Interactive is slow (>3.8s)");
    recommendations.push("   • Implement code splitting");
    recommendations.push("   • Defer non-critical JavaScript");
    recommendations.push("   • Optimize third-party scripts");
  }

  // Check TBT
  if (metrics.totalBlockingTime > 300) {
    issues.push("⚠️  Total Blocking Time is high (>300ms)");
    recommendations.push("   • Break up long tasks");
    recommendations.push("   • Use web workers for heavy computations");
    recommendations.push("   • Optimize JavaScript execution");
  }

  // Check CLS
  if (metrics.cumulativeLayoutShift > 0.1) {
    issues.push("⚠️  Cumulative Layout Shift is high (>0.1)");
    recommendations.push("   • Add width/height to images");
    recommendations.push("   • Avoid inserting content above existing content");
    recommendations.push("   • Use CSS transforms for animations");
  }

  if (issues.length === 0) {
    console.log("  ✅ All metrics are within optimal range!");
  } else {
    console.log("  Issues found:");
    issues.forEach((issue) => console.log(`  ${issue}`));
    console.log("");
    console.log("  💡 Recommendations:");
    recommendations.forEach((rec) => console.log(`  ${rec}`));
  }

  console.log("");
}

// Main execution
const url = process.argv[2] || "http://localhost:8080";
runLighthouseAudit(url);
