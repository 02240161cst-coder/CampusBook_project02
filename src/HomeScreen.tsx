/**
 * ─────────────────────────────────────────────────────────────
 *  BACKEND SWITCH
 * ─────────────────────────────────────────────────────────────
 *  false → Local demo backend (AsyncStorage). Works instantly in
 *          Expo Go, no Firebase account needed.
 *  true  → Real Firebase Auth + Cloud Firestore (same collections
 *          as the Project I Android app: users / venues / bookings).
 *
 *  See README.md → "Connecting Firebase".
 */
export const USE_FIREBASE = false;

/**
 * Firebase *Web app* config (Firebase console → Project settings →
 * Your apps → Add app → Web </>). NOT the google-services.json values.
 */
export const firebaseConfig = {
  apiKey: 'PASTE_YOUR_WEB_API_KEY',
  authDomain: 'campusbook-32e90.firebaseapp.com',
  projectId: 'campusbook-32e90',
  storageBucket: 'PASTE_STORAGE_BUCKET',
  messagingSenderId: 'PASTE_SENDER_ID',
  appId: 'PASTE_WEB_APP_ID',
};

/** If the Firestore `venues` collection is empty, upload the 10 default venues once. */
export const SEED_VENUES_IF_EMPTY = true;
