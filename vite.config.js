import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js + GSAP make one ~1MB (≈320KB gzip) bundle by design
    chunkSizeWarningLimit: 1200,
  },
})
