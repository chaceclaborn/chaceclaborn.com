// js/firebase/config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ✅ Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZLt0X2jGoUctHaiCX8-y0Yspz4aU7u_E",
  authDomain: "chaceclabornwebsite.firebaseapp.com",
  projectId: "chaceclabornwebsite",
  storageBucket: "chaceclabornwebsite.firebasestorage.app",
  messagingSenderId: "357343717980",
  appId: "1:357343717980:web:c451370115b7a970689499",
  measurementId: "G-V9CLBVZ0D5"
};

// ✅ Initialize Firebase App (shared across your app)
const app = initializeApp(firebaseConfig);

// ✅ Auth instance (for sign-in/out and tracking user state)
const auth = getAuth(app);

// ✅ Firestore instance (browser SDK only supports default DB)
const db = getFirestore(app);

console.log("✅ Firebase initialized. Firestore DB:", db._databaseId.database); 
// Logs: "(default)"

// ✅ Export shared instances for the rest of your app
export { app, auth, db };
