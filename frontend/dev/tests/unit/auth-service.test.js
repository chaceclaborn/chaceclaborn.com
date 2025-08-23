import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockUser, createMockFirebaseError } from '../utils/testHelpers.js';

// Mock Firebase modules
vi.mock('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({
    setCustomParameters: vi.fn()
  })),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn()
}));

vi.mock('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date())
}));

describe('🔐 Authentication Service Tests', () => {
  let authFunctions;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    // Import the actual auth service
    authFunctions = await import('../../../js/firebase/auth-service.js');
  });

  it('should export all required functions', () => {
    expect(authFunctions.signInWithGoogle).toBeDefined();
    expect(authFunctions.signInWithEmail).toBeDefined();
    expect(authFunctions.createAccount).toBeDefined();
    expect(authFunctions.signOutUser).toBeDefined();
    expect(authFunctions.observeAuthState).toBeDefined();
    expect(authFunctions.getCurrentUser).toBeDefined();
    expect(authFunctions.getErrorMessage).toBeDefined();
  });

  it('should have default export with all methods', () => {
    expect(authFunctions.default).toBeDefined();
    expect(authFunctions.default.signInWithGoogle).toBeDefined();
  });
});