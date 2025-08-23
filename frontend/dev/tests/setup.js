// tests/setup.js - Comprehensive test environment setup
import { vi, beforeAll, afterEach, afterAll } from 'vitest';

// Test run statistics
global.testStats = {
  startTime: Date.now(),
  testsRun: 0,
  testsPassed: 0,
  testsFailed: 0
};

console.log('\n🧪 Initializing Test Environment');
console.log('=' .repeat(50));
console.log(`📅 Date: ${new Date().toLocaleString()}`);
console.log(`💻 Platform: ${process.platform}`);
console.log(`🔧 Node Version: ${process.version}`);
console.log('=' .repeat(50) + '\n');

// Mock Firebase modules
vi.mock('../../js/firebase/config.js', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn((callback) => {
      callback(null);
      return vi.fn(); // unsubscribe function
    })
  },
  db: {
    collection: vi.fn(),
    doc: vi.fn()
  }
}));

// Enhanced DOM environment
global.window = {
  location: {
    href: 'http://localhost:3000',
    hostname: 'localhost',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'http://localhost:3000',
    reload: vi.fn(),
    assign: vi.fn()
  },
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  },
  navigator: {
    userAgent: 'Mozilla/5.0 (Testing Environment) Chrome/120.0.0.0',
    platform: 'Test Platform',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    cookieEnabled: true
  },
  screen: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24
  },
  innerWidth: 1920,
  innerHeight: 1080,
  outerWidth: 1920,
  outerHeight: 1080,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout,
  setInterval: global.setInterval,
  clearInterval: global.clearInterval,
  requestAnimationFrame: vi.fn((cb) => setTimeout(cb, 16)),
  cancelAnimationFrame: vi.fn(clearTimeout)
};

// Assign window properties to global
Object.assign(global, {
  window: global.window,
  navigator: global.window.navigator,
  location: global.window.location,
  history: global.window.history,
  screen: global.window.screen
});

// Enhanced document mock
global.document = {
  title: 'Test Page',
  referrer: '',
  cookie: '',
  readyState: 'complete',
  documentElement: {
    scrollTop: 0,
    scrollLeft: 0,
    clientWidth: 1920,
    clientHeight: 1080
  },
  body: {
    innerHTML: '',
    insertAdjacentHTML: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(() => false)
    },
    style: {},
    scrollTop: 0,
    scrollLeft: 0,
    offsetWidth: 1920,
    offsetHeight: 1080
  },
  head: {
    appendChild: vi.fn()
  },
  getElementById: vi.fn((id) => {
    const elements = {
      'signInBtn': { 
        style: { display: 'block' },
        addEventListener: vi.fn(),
        click: vi.fn()
      },
      'authModal': { 
        style: { display: 'none' },
        addEventListener: vi.fn()
      },
      'userInfo': { style: { display: 'none' } },
      'userEmail': { textContent: '' },
      'userAvatar': { src: '' },
      'memberNav': { style: { display: 'none' } }
    };
    return elements[id] || null;
  }),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  createElement: vi.fn((tag) => ({
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn()
    },
    addEventListener: vi.fn(),
    appendChild: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn()
  })),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  createEvent: vi.fn(() => ({
    initEvent: vi.fn()
  })),
  dispatchEvent: vi.fn()
};

// Storage mocks with persistence
const createPersistentStorage = (name) => {
  let store = {};
  return {
    getItem: vi.fn((key) => {
      console.log(`  📦 ${name}.getItem('${key}') => ${store[key] || 'null'}`);
      return store[key] || null;
    }),
    setItem: vi.fn((key, value) => {
      console.log(`  📦 ${name}.setItem('${key}', '${value}')`);
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      console.log(`  📦 ${name}.removeItem('${key}')`);
      delete store[key];
    }),
    clear: vi.fn(() => {
      console.log(`  📦 ${name}.clear()`);
      store = {};
    }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index) => Object.keys(store)[index] || null),
    _getStore: () => store,
    _setStore: (newStore) => store = newStore
  };
};

global.localStorage = createPersistentStorage('localStorage');
global.sessionStorage = createPersistentStorage('sessionStorage');

// Fetch mock with detailed logging
global.fetch = vi.fn((url, options = {}) => {
  console.log(`  🌐 Fetch: ${options.method || 'GET'} ${url}`);
  
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Map([['content-type', 'application/json']]),
    json: () => Promise.resolve({ 
      success: true,
      ip: '127.0.0.1',
      data: 'mock response' 
    }),
    text: () => Promise.resolve('mock text response'),
    blob: () => Promise.resolve(new Blob(['mock blob'])),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
  });
});

// Performance API mock
global.performance = {
  now: () => Date.now() - global.testStats.startTime,
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn((type) => {
    if (type === 'navigation') {
      return [{
        name: document.location.href,
        entryType: 'navigation',
        startTime: 0,
        duration: 200,
        domContentLoadedEventEnd: 100,
        domContentLoadedEventStart: 50,
        loadEventEnd: 200,
        loadEventStart: 100,
        domInteractive: 80,
        fetchStart: 0
      }];
    }
    return [];
  }),
  getEntriesByName: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn()
};

// Console enhancements
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

console.log = (...args) => {
  originalConsole.log(`${colors.cyan}[TEST LOG]${colors.reset}`, ...args);
};

console.error = (...args) => {
  originalConsole.error(`${colors.red}[TEST ERROR]${colors.reset}`, ...args);
};

console.warn = (...args) => {
  originalConsole.warn(`${colors.yellow}[TEST WARN]${colors.reset}`, ...args);
};

console.info = (...args) => {
  originalConsole.info(`${colors.blue}[TEST INFO]${colors.reset}`, ...args);
};

// Test lifecycle hooks
beforeAll(() => {
  console.log('\n🚀 Starting Test Suite\n');
});

afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Reset storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Reset document
  document.body.innerHTML = '';
  
  // Track test completion
  global.testStats.testsRun++;
});

afterAll(() => {
  const duration = ((Date.now() - global.testStats.startTime) / 1000).toFixed(2);
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Run Complete');
  console.log('=' .repeat(50));
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`📈 Tests Run: ${global.testStats.testsRun}`);
  console.log('=' .repeat(50) + '\n');
});

// Export test utilities
export { colors };

console.log('✅ Test Environment Ready!\n');