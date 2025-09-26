import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5175,
  },
  plugins: [react(), tailwindcss()],
  // GitHub Pages deployment configuration
  base: process.env.NODE_ENV === 'production' ? '/backtester/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure paths are relative for GitHub Pages
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
