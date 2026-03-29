import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    target: 'esnext',
    // Raise limit since Three.js is inherently large; chunks are still split and cached
    chunkSizeWarningLimit: 1000,
    // Use esbuild for minification (fast + effective)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Split key libraries into separate, long-cached chunks
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion'],
          icons: ['lucide-react'],
          webgl: ['three', '@react-three/fiber', '@react-three/drei'],
          ogl: ['ogl'],
        }
      }
    },
    // Drop all console.* and debugger calls in production bundle
    esbuildOptions: {
      drop: ['console', 'debugger'],
    }
  },
  server: {
    // Allow access from any local network IP for testing on mobile devices
    host: '172.30.83.187',
    port: 8080,
  }
})
