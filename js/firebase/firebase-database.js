// Initialize Firestore database
const db = firebase.firestore();

// Function to log user login
async function logUserLogin(user) {
    try {
        const userRef = db.collection('users').doc(user.uid);
        await userRef.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            loginCount: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });
        
        // Log login activity
        await db.collection('loginActivity').add({
            uid: user.uid,
            email: user.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error('Error logging user:', error);
    }
}

// Example functions for other database operations
async function saveUserData(uid, data) {
    return db.collection('users').doc(uid).update(data);
}

async function getUserData(uid) {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? doc.data() : null;
}