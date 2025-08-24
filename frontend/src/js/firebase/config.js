// js/firebase/config.js - Refactored Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { firebaseConfig } from '../config/environment.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Firebase');

// Initialize Firebase App
logger.info('Initializing Firebase...');
const app = initializeApp(firebaseConfig);

// Auth instance
const auth = getAuth(app);

// Firestore instance
const db = getFirestore(app);

// Log success
logger.success('Firebase initialized', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Export shared instances
export { app, auth, db };