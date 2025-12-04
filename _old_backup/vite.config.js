import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  // Root is the src directory where index.html lives
  root: 'src',

  // Public directory for static assets (images, files, etc.)
  publicDir: '../public',

  // Add React plugin for JSX support
  plugins: [react()],

  // Development server configuration
  server: {
    port: 3000,
    open: true,  // Auto-open browser
    host: true,  // Allows network access
  },

  // Build configuration
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        portfolio: resolve(__dirname, 'src/pages/portfolio.html'),
        resume: resolve(__dirname, 'src/pages/resume.html'),
        admin: resolve(__dirname, 'src/pages/admin.html'),
        girlfriend: resolve(__dirname, 'src/pages/girlfriend.html'),
        family: resolve(__dirname, 'src/pages/family.html'),
      }
    }
  },

  // Path resolution aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@config': resolve(__dirname, './src/config'),
      '@utils': resolve(__dirname, './src/utils'),
      '@styles': resolve(__dirname, './src/styles'),
    }
  },

  // Test configuration (Vitest uses this!)
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'tests/**/*.test.{js,jsx}',
      'tests/**/*.spec.{js,jsx}',
      'src/**/*.test.{js,jsx}',
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'archive/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'tests/**',
        'dist/**',
        'archive/**',
      ]
    }
  }
});
