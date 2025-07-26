import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './dev/tests/setup.js',  // Changed path
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['js/**/*.js'],
      exclude: [
        'node_modules/',
        'dev/',
        'js/chatbot-botui.js'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
    reporters: ['verbose'],
    testTimeout: 10000,
    pool: 'forks',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './js'),
      '@firebase': path.resolve(__dirname, './js/firebase'),
      '@tests': path.resolve(__dirname, './dev/tests')  // Changed path
    }
  }
});