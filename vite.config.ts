import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Browser polyfills for Node.js modules
      "path": "path-browserify",
      "fs": path.resolve(__dirname, "./src/polyfills/fs"),
      "crypto": path.resolve(__dirname, "./src/polyfills/crypto.ts"),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'global': 'globalThis',
    '__filename': JSON.stringify(''),
    '__dirname': JSON.stringify(''),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
        __filename: '""',
        __dirname: '""',
      }
    }
  }
}));
