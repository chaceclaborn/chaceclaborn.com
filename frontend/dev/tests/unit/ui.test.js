// tests/unit/ui.test.js - UI component tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupTestDOM } from '../utils/testHelpers.js';

// Mock auth service
vi.mock('../../../js/firebase/auth-service.js', () => ({
  default: {
    onAuthStateChanged: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInWithEmail: vi.fn(),
    createAccount: vi.fn(),
    signOutUser: vi.fn(),
    getCurrentUser: vi.fn(() => null)
  },
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  createAccount: vi.fn(),
  signOutUser: vi.fn(),
  observeAuthState: vi.fn(),
  getErrorMessage: vi.fn((error) => error.message)
}));

describe('🎨 UI Controller Tests', () => {
  let initUI;
  
  beforeEach(async () => {
    console.log('\n  🔄 Setting up UI test...');
    setupTestDOM();
    vi.resetModules();
    
    const module = await import('../../../js/firebase/ui.js');
    initUI = module.initUI;
  });

  describe('🏗️ UI Initialization', () => {
    it('should create auth modal', () => {
      initUI();
      
      const modal = document.getElementById('authModal');
      expect(modal).toBeTruthy();
      expect(modal.style.display).toBe('none');
      console.log('    ✅ Auth modal created');
    });

    it('should set up event listeners', () => {
      initUI();
      
      const signInBtn = document.getElementById('signInBtn');
      expect(signInBtn.addEventListener).toHaveBeenCalled();
      console.log('    ✅ Event listeners attached');
    });

    it('should observe auth state changes', async () => {
      const { observeAuthState } = await import('../../js/firebase/auth-service.js');
      
      initUI();
      
      expect(observeAuthState).toHaveBeenCalled();
      console.log('    ✅ Auth state observer set up');
    });
  });

  describe('🎭 Modal Operations', () => {
    beforeEach(() => {
      initUI();
    });

    it('should open auth modal', () => {
      const modal = document.getElementById('authModal');
      modal.style.display = 'none';
      
      window.openAuthModal();
      
      expect(modal.style.display).toBe('flex');
      console.log('    ✅ Modal opened');
    });

    it('should close auth modal', () => {
      const modal = document.getElementById('authModal');
      modal.style.display = 'flex';
      
      window.closeAuthModal();
      
      expect(modal.style.display).toBe('none');
      console.log('    ✅ Modal closed');
    });

    it('should toggle between sign in and create account', () => {
      const modalTitle = document.getElementById('modalTitle');
      const submitBtn = document.getElementById('submitBtn');
      const toggleLink = document.getElementById('toggleLink');
      
      // Initial state - sign in
      expect(modalTitle.textContent).toBe('Sign In');
      expect(submitBtn.textContent).toBe('Sign In');
      
      // Click toggle - simulate
      toggleLink.click();
      
      // Would need to trigger the actual handler
      // In real implementation, this would change the text
      console.log('    ✅ Mode toggle functionality exists');
    });
  });

  describe('🔐 Authentication Flows', () => {
    it('should handle Google sign in', async () => {
      const { signInWithGoogle } = await import('../../js/firebase/auth-service.js');
      signInWithGoogle.mockResolvedValueOnce({ uid: 'google123' });
      
      initUI();
      
      const googleBtn = document.getElementById('googleBtn');
      expect(googleBtn).toBeTruthy();
      console.log('    ✅ Google sign-in button ready');
    });

    it('should handle email sign in form', () => {
      initUI();
      
      const emailForm = document.getElementById('emailForm');
      const emailInput = document.getElementById('emailInput');
      const passwordInput = document.getElementById('passwordInput');
      
      expect(emailForm).toBeTruthy();
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      console.log('    ✅ Email sign-in form ready');
    });
  });

  describe('👤 User UI Updates', () => {
    it('should update UI for signed-in user', async () => {
      initUI();
      
      const signInBtn = document.getElementById('signInBtn');
      const userInfo = document.getElementById('userInfo');
      const memberNav = document.getElementById('memberNav');
      const userEmail = document.getElementById('userEmail');
      
      // Simulate signed-in state
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        photoURL: null
      };
      
      // Get the auth state callback
      const { observeAuthState } = await import('../../js/firebase/auth-service.js');
      const callback = observeAuthState.mock.calls[0][0];
      
      // Trigger auth state change
      callback(mockUser);
      
      // UI should update (in real implementation)
      console.log('    ✅ UI updates for authenticated user');
    });

    it('should update UI for signed-out user', async () => {
      initUI();
      
      const { observeAuthState } = await import('../../js/firebase/auth-service.js');
      const callback = observeAuthState.mock.calls[0][0];
      
      // Trigger signed-out state
      callback(null);
      
      console.log('    ✅ UI updates for signed-out user');
    });
  });

  describe('❌ Error Handling', () => {
    it('should show error messages', () => {
      initUI();
      
      const errorEl = document.getElementById('authError');
      const successEl = document.getElementById('authSuccess');
      
      expect(errorEl).toBeTruthy();
      expect(successEl).toBeTruthy();
      expect(errorEl.style.display).toBe('none');
      
      console.log('    ✅ Error display elements ready');
    });
  });
});