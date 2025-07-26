// js/firebase/config.js - Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZLt0X2jGoUctHaiCX8-y0Yspz4aU7u_E",
  authDomain: "chaceclabornwebsite.firebaseapp.com",
  projectId: "chaceclabornwebsite",
  storageBucket: "chaceclabornwebsite.firebasestorage.app",
  messagingSenderId: "357343717980",
  appId: "1:357343717980:web:c451370115b7a970689499"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('✅ Firebase initialized');
console.log('📱 Firebase App:', app);
console.log('🔐 Auth instance:', auth);
console.log('💾 Firestore instance:', db);

// Test Firestore connection
db._settings && console.log('✅ Firestore settings:', db._settings.host);

export { auth, db };