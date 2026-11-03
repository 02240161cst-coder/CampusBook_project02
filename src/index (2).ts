/**
 * Firebase implementation (Auth + Cloud Firestore).
 * Uses the SAME collections and field names as the Project I Android app:
 *   users/{uid}      → uid, fullName, studentId, email, userType
 *   venues/{id}      → name, location, description, category, capacity
 *   bookings/{id}    → userId, venueName, bookingDate (dd/MM/yyyy), startTime, endTime,
 *                      startTimeMinutes, endTimeMinutes, createdAt (Timestamp), purpose, attendees
 * so existing Project I data keeps working.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { SEED_VENUES_IF_EMPTY, firebaseConfig } from '../config';
import { Booking, NewBooking, UserProfile, Venue } from '../types';
import { SEED_VENUES } from './seedVenues';
import { Backend, BackendError } from './types';

/** Turns Firebase error codes into readable messages. */
function friendly(e: any): BackendError {
  const code: string = e?.code ?? '';
  const map: Record<string, string> = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/invalid-email': 'The email address is badly formatted.',
    'auth/email-already-in-use': 'The email address is already in use by another account.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'permission-denied': 'Permission denied. Check your Firestore security rules.',
    unavailable: 'Cannot reach the server. Check your internet connection.',
  };
  return new BackendError(map[code] ?? e?.message ?? 'Something went wrong');
}

async function wrap<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    throw friendly(e);
  }
}

export function createFirebaseBackend(): Backend {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // Persist the login between app launches (React Native needs AsyncStorage).
  let auth: FirebaseAuth.Auth;
  try {
    const A = FirebaseAuth as any;
    auth = A.initializeAuth(app, { persistence: A.getReactNativePersistence(AsyncStorage) });
  } catch {
    auth = FirebaseAuth.getAuth(app); // already initialised (e.g. fast refresh)
  }
  const db = getFirestore(app);

  const toBooking = (id: string, d: any): Booking => ({
    id,
    userId: d.userId ?? '',
    venueName: d.venueName ?? '',
    bookingDate: d.bookingDate ?? '',
    startTime: d.startTime ?? '',
    endTime: d.endTime ?? '',
    startTimeMinutes: d.startTimeMinutes ?? 0,
    endTimeMinutes: d.endTimeMinutes ?? 0,
    createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : Number(d.createdAt ?? 0),
    purpose: d.purpose ?? '',
    attendees: d.attendees ?? 0,
    requirements: d.requirements ?? '',
  });

  return {
    auth: {
      onAuthChange(cb) {
        return FirebaseAuth.onAuthStateChanged(auth, (u) =>
          cb(u ? { uid: u.uid, email: u.email ?? '' } : null),
        );
      },

      signIn: (email, password) =>
        wrap(async () => {
          const cred = await FirebaseAuth.signInWithEmailAndPassword(auth, email, password);
          return { uid: cred.user.uid, email: cred.user.email ?? email };
        }),

      register: ({ fullName, studentId, email, password }) =>
        wrap(async () => {
          const cred = await FirebaseAuth.createUserWithEmailAndPassword(auth, email, password);
          const profile: UserProfile = {
            uid: cred.user.uid, fullName, studentId, email, userType: 'Student',
          };
          await setDoc(doc(db, 'users', profile.uid), profile);
          return { user: { uid: profile.uid, email }, profile };
        }),

      signOut: () => wrap(() => FirebaseAuth.signOut(auth)),
    },

    users: {
      get: (uid) =>
        wrap(async () => {
          const snap = await getDoc(doc(db, 'users', uid));
          if (!snap.exists()) return null;
          const d = snap.data() as any;
          return {
            uid: d.uid ?? uid,
            fullName: d.fullName ?? '',
            studentId: d.studentId ?? '',
            email: d.email ?? '',
            userType: d.userType ?? 'Student',
          };
        }),
    },

    venues: {
      list: () =>
        wrap(async () => {
          let snap = await getDocs(collection(db, 'venues'));
          if (snap.empty && SEED_VENUES_IF_EMPTY) {
            await Promise.all(SEED_VENUES.map((v) => addDoc(collection(db, 'venues'), v)));
            snap = await getDocs(collection(db, 'venues'));
          }
          return snap.docs.map((d): Venue => {
            const v = d.data() as any;
            return {
              id: d.id,
              name: v.name ?? '',
              location: v.location ?? '',
              description: v.description ?? '',
              category: v.category ?? '',
              capacity: v.capacity ?? 0,
            };
          });
        }),
    },

    bookings: {
      listByUser: (uid) =>
        wrap(async () => {
          // Sorted on the client so no composite Firestore index is required.
          const snap = await getDocs(query(collection(db, 'bookings'), where('userId', '==', uid)));
          return snap.docs.map((d) => toBooking(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt);
        }),

      get: (id) =>
        wrap(async () => {
          const snap = await getDoc(doc(db, 'bookings', id));
          return snap.exists() ? toBooking(snap.id, snap.data()) : null;
        }),

      listForVenueDate: (venueName, bookingDate) =>
        wrap(async () => {
          const snap = await getDocs(
            query(
              collection(db, 'bookings'),
              where('venueName', '==', venueName),
              where('bookingDate', '==', bookingDate),
            ),
          );
          return snap.docs.map((d) => toBooking(d.id, d.data()));
        }),

      create: (data: NewBooking) =>
        wrap(async () => {
          const ref = await addDoc(collection(db, 'bookings'), {
            ...data,
            createdAt: Timestamp.fromMillis(data.createdAt),
          });
          return ref.id;
        }),

      update: (id, patch) => wrap(() => updateDoc(doc(db, 'bookings', id), patch as any)),

      remove: (id) => wrap(() => deleteDoc(doc(db, 'bookings', id))),
    },
  };
}
