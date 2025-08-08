// js/utils/logger.js - Smart logging utility that replaces console.log
// Only logs in development, silent in production

import { isDevelopment, config } from '../config/environment.js';

class Logger {
  constructor(module = 'App') {
    this.module = module;
    this.enabled = isDevelopment && config.features.logging;
    this.history = [];
    this.maxHistory = 100;
  }

  // Format log message with timestamp and module
  formatMessage(level, args) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] [${this.module}]`;
    return { prefix, args, level, timestamp: Date.now() };
  }

  // Store log in history for debugging
  addToHistory(entry) {
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  // Standard log (replaces console.log)
  log(...args) {
    const entry = this.formatMessage('log', args);
    this.addToHistory(entry);
    
    if (this.enabled) {
      console.log(entry.prefix, ...args);
    }
  }

  // Success messages (green in console)
  success(...args) {
    const entry = this.formatMessage('success', args);
    this.addToHistory(entry);
    
    if (this.enabled) {
      console.log(
        `%c${entry.prefix} ✅`,
        'color: #4caf50; font-weight: bold',
        ...args
      );
    }
  }

  // Info messages (blue in console)
  info(...args) {
    const entry = this.formatMessage('info', args);
    this.addToHistory(entry);
    
    if (this.enabled) {
      console.info(
        `%c${entry.prefix} ℹ️`,
        'color: #2196f3; font-weight: bold',
        ...args
      );
    }
  }

  // Warning messages (always show, even in production)
  warn(...args) {
    const entry = this.formatMessage('warn', args);
    this.addToHistory(entry);
    
    // Warnings show in production too
    console.warn(entry.prefix, '⚠️', ...args);
  }

  // Error messages (always show, even in production)
  error(...args) {
    const entry = this.formatMessage('error', args);
    this.addToHistory(entry);
    
    // Errors always show
    console.error(entry.prefix, '❌', ...args);
    
    // In production, could send to error tracking service
    if (!isDevelopment && config.features.errorTracking) {
      this.reportError(args);
    }
  }

  // Debug messages (only in debug mode)
  debug(...args) {
    if (this.enabled && config.features.debugMode) {
      const entry = this.formatMessage('debug', args);
      this.addToHistory(entry);
      
      console.log(
        `%c${entry.prefix} 🐛`,
        'color: #9c27b0; font-style: italic',
        ...args
      );
    }
  }

  // Group console logs
  group(label) {
    if (this.enabled) {
      console.group(`[${this.module}] ${label}`);
    }
  }

  groupEnd() {
    if (this.enabled) {
      console.groupEnd();
    }
  }

  // Table display for data
  table(data) {
    if (this.enabled) {
      console.table(data);
    }
  }

  // Timing functions
  time(label) {
    if (this.enabled) {
      console.time(`[${this.module}] ${label}`);
    }
  }

  timeEnd(label) {
    if (this.enabled) {
      console.timeEnd(`[${this.module}] ${label}`);
    }
  }

  // Get log history
  getHistory() {
    return this.history;
  }

  // Clear log history
  clearHistory() {
    this.history = [];
  }

  // Report errors to monitoring service (placeholder)
  reportError(args) {
    // In production, send to Sentry, LogRocket, etc.
    // Example:
    // Sentry.captureException(args[0]);
  }
}

// Factory function to create loggers for different modules
export function createLogger(moduleName) {
  return new Logger(moduleName);
}

// Create default logger
const defaultLogger = new Logger('App');

// Export both the class and a default instance
export { Logger };
export default defaultLogger;