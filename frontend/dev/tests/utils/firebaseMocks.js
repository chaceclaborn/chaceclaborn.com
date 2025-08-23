// Firebase-specific mock utilities
import { vi } from 'vitest';

export function createFirebaseApp() {
  return {
    name: '[DEFAULT]',
    options: {},
    automaticDataCollectionEnabled: false
  };
}

export function createAuth() {
  let currentUser = null;
  const authStateCallbacks = [];
  
  return {
    currentUser,
    signOut: vi.fn(() => {
      currentUser = null;
      authStateCallbacks.forEach(cb => cb(null));
    }),
    onAuthStateChanged: vi.fn((callback) => {
      authStateCallbacks.push(callback);
      callback(currentUser);
      return () => {
        const index = authStateCallbacks.indexOf(callback);
        if (index > -1) authStateCallbacks.splice(index, 1);
      };
    }),
    _setCurrentUser: (user) => {
      currentUser = user;
      authStateCallbacks.forEach(cb => cb(user));
    }
  };
}

export function createFirestoreDb() {
  const collections = new Map();
  
  return {
    collection: vi.fn((name) => {
      if (!collections.has(name)) {
        collections.set(name, new Map());
      }
      return {
        add: vi.fn((data) => {
          const id = 'doc-' + Date.now();
          collections.get(name).set(id, data);
          return Promise.resolve({ id });
        })
      };
    }),
    _getCollection: (name) => collections.get(name),
    _reset: () => collections.clear()
  };
}