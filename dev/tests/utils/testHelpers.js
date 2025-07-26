// dev/tests/utils/testHelpers.js
import { vi } from 'vitest';

export function createMockUser(overrides = {}) {
  return {
    uid: 'test-' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    ...overrides
  };
}

export function createMockFirebaseError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export async function waitForAsync(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function setupTestDOM() {
  document.body.innerHTML = `
    <div id="signInBtn">Sign In</div>
    <div id="authModal" style="display: none;">
      <h2 id="modalTitle">Sign In</h2>
      <div id="authError" style="display: none;"></div>
      <div id="authSuccess" style="display: none;"></div>
      <button id="googleBtn">Sign in with Google</button>
      <form id="emailForm">
        <input id="emailInput" type="email" />
        <input id="passwordInput" type="password" />
        <button id="submitBtn">Sign In</button>
      </form>
      <a id="toggleLink">Create account</a>
    </div>
    <div id="userInfo" style="display: none;">
      <img id="userAvatar" />
      <span id="userEmail"></span>
      <a id="signOutLink">Sign Out</a>
    </div>
    <div id="memberNav" style="display: none;"></div>
  `;
}