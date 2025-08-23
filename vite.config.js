// vite.config.js - Fixed aliases
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'frontend',
  
  // Add React plugin
  plugins: [react()],
  
  // Development server
  server: {
    port: 3000,
    open: true,
    host: true  // Allows network access
  },
  
  // Build configuration
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'frontend/index.html',
        portfolio: 'frontend/pages/portfolio.html',
        resume: 'frontend/pages/resume.html',
        admin: 'frontend/pages/admin.html',
        girlfriend: 'frontend/pages/girlfriend.html',
        family: 'frontend/pages/family.html'
      }
    }
  },
  
  // FIXED: Path resolution - aliases relative to 'frontend' root
  resolve: {
    alias: {
      '@': '',  // Points to frontend root
      '@js': '/js',  // Points to frontend/js
      '@css': '/css',  // Points to frontend/css
      '@components': '/js/components'  // Points to frontend/js/components
    }
  },
  
  // Test configuration (Vitest uses this!)
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'frontend/**/*.test.js',
      'frontend/**/*.spec.js',
      'backend/**/*.test.js'
    ],
    exclude: [
      'node_modules/**',
      'dist/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage'
    }
  }
});