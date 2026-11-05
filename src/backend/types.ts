import { AuthUser, Booking, NewBooking, ProfilePatch, UserProfile, UserType, Venue } from '../types';

/**
 * Everything the UI needs from a backend. Two implementations exist:
 *   • mockBackend     – AsyncStorage, for instant demo in Expo Go
 *   • firebaseBackend – Firebase Auth + Cloud Firestore (production)
 * Screens only talk to this interface, so switching is a one-line config change.
 */
export interface Backend {
  auth: {
    /** Fires once at startup (user or null) and on every sign-in / sign-out. */
    onAuthChange(cb: (user: AuthUser | null) => void): () => void;
    signIn(email: string, password: string): Promise<AuthUser>;
    register(input: {
      fullName: string;
      studentId: string;
      email: string;
      password: string;
      userType: UserType;
    }): Promise<{ user: AuthUser; profile: UserProfile }>;
    signOut(): Promise<void>;
  };
  users: {
    get(uid: string): Promise<UserProfile | null>;
    /** Project II: edit profile (name, ID, photo). Returns the updated profile. */
    update(uid: string, patch: ProfilePatch): Promise<UserProfile>;
  };
  venues: {
    list(): Promise<Venue[]>;
  };
  bookings: {
    listByUser(uid: string): Promise<Booking[]>;
    /** Project II calendar: every booking on campus (used to show which venues are booked on a date). */
    listAll(): Promise<Booking[]>;
    get(id: string): Promise<Booking | null>;
    /** All bookings of one venue on one date (any user) – used for conflict checks. */
    listForVenueDate(venueName: string, bookingDate: string): Promise<Booking[]>;
    create(data: NewBooking): Promise<string>;
    update(id: string, patch: Partial<NewBooking>): Promise<void>;
    remove(id: string): Promise<void>;
  };
}

/** Error thrown by backends – `message` is shown to the user in a toast. */
export class BackendError extends Error {}
