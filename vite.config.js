import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure proper base path for Vercel
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom']
        }
      }
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    // Asset handling
    assetsDir: 'assets',
    copyPublicDir: true,
    // Source maps for production debugging (optional)
    sourcemap: false,
    // Asset size warning threshold
    chunkSizeWarningLimit: 1000
  },
  // Development server configuration
  server: {
    port: 5173,
    host: true // Allow external connections
  },
  // Preview server configuration (for production builds)
  preview: {
    port: 4173,
    host: true
  }
})
