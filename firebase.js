// Minimal Firebase init for Google Sign-in
// Replace the config object with your Firebase project's values.
const firebaseConfig = {
  apiKey: "AIzaSyB60TEqBRoE6hIO7NbZ6ag7x0wO58lOc_Q",
  authDomain: "modeldesk-8d6d8.firebaseapp.com",
  projectId: "modeldesk-8d6d8",
  storageBucket: "modeldesk-8d6d8.firebasestorage.app",
  messagingSenderId: "1062613089033",
  appId: "1:1062613089033:web:491d4ffd7412c03a60b1d8",
  measurementId: "G-PXM5J9MJPH"
};

if (window.firebase && !window._md_firebase_inited) {
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

  // Expose a simple helper for the site code
  window.mdAuth = {
    auth,
    signInWithGoogle: async () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      return auth.signInWithPopup(provider);
    },
    signOut: () => auth.signOut(),
    onAuthStateChanged: (cb) => auth.onAuthStateChanged(cb),
    currentUser: () => auth.currentUser
  };

  window._md_firebase_inited = true;
} else if (!window.firebase) {
  console.warn('Firebase SDK not found. Add Firebase scripts before using auth features.');
}
