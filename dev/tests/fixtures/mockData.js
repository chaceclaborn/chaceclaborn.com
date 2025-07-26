// dev/tests/fixtures/mockData.js
export const mockUsers = {
  validUser: {
    uid: 'test123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true
  },
  newUser: {
    uid: 'new456',
    email: 'newuser@example.com',
    displayName: 'New User',
    emailVerified: false
  },
  googleUser: {
    uid: 'google789',
    email: 'google@example.com',
    displayName: 'Google User',
    photoURL: 'https://google.com/photo.jpg',
    providerId: 'google.com'
  }
};

export const mockErrors = {
  authErrors: {
    'auth/popup-closed-by-user': 'The popup was closed by the user',
    'auth/wrong-password': 'The password is invalid',
    'auth/user-not-found': 'No user found with this email',
    'auth/email-already-in-use': 'Email is already registered'
  }
};