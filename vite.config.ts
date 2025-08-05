// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable fast refresh, JSX, etc.
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Allows "@/..." imports
    },
  },
  server: {
    port: 5173,       // Customize the dev server port
    open: true,       // Automatically opens the browser
  },
  build: {
    outDir: 'dist',   // Output directory
    sourcemap: true,  // Helpful for debugging production builds
  },
});
