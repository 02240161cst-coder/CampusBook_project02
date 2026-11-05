/**
 * BACKEND SWITCH
 * false = Local demo backend
 * true  = Firebase Auth + Cloud Firestore
 */
export const USE_FIREBASE = true;

/**
 * Firebase Web App configuration
 * Use the values from Firebase Console → Project settings → Your apps → Web app.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBCF2kHLldG9yQUmUMdm72WUxV8bzGUl7Y",
  authDomain: 'campusbook-32e90.firebaseapp.com',
  projectId: 'campusbook-32e90',
  storageBucket: "campusbook-32e90.firebasestorage.app",
  messagingSenderId: "240017642208",
  appId: "1:240017642208:web:b3f40a14d2a3df8470f685",
  measurementId: "G-WDNDVFB23C"
};

/**
 * Only seed default venues if the Firestore venues collection is empty.
 */
export const SEED_VENUES_IF_EMPTY = true;
