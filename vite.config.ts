import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Brotli compression for production
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024, // Only compress files > 1KB
    }),
    // Gzip compression as fallback
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
    }),
    // Bundle analyzer
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: "treemap", // sunburst, treemap, network
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      external: ["midstreamer"],
      output: {
        manualChunks: {
          // React core libraries
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // UI component libraries
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
          // Chart library
          "chart-vendor": ["recharts"],
          // React Query
          "query-vendor": ["@tanstack/react-query"],
          // Date utilities
          "date-vendor": ["date-fns"],
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").slice(-1)[0]
            : "chunk";
          return `assets/js/[name]-[hash].js`;
        },
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        globals: {
          midstreamer: "MidStreamer",
        },
      },
    },
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Source maps for production debugging (disable for smaller bundles)
    sourcemap: false,
    // Report compressed size
    reportCompressedSize: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
    global: "globalThis",
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "recharts",
      "date-fns",
    ],
    exclude: ["lovable-tagger", "midstreamer"],
  },
  // Worker and WASM support
  worker: {
    format: "es",
  },
  // Handle WASM files
  assetsInclude: ["**/*.wasm"],
}));
