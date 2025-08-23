// vite.config.js (at root level)
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',
  
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
  
  // Path resolution
  resolve: {
    alias: {
      '@': '/frontend',
      '@js': '/frontend/js',
      '@css': '/frontend/css'
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