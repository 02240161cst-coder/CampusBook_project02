/** Mirrors model/Venue.kt, model/Booking.kt, model/User.kt */
export interface Venue {
  id: string;
  name: string;
  location: string;
  description: string;
  category: string;
  capacity: number;
}

export interface Booking {
  id: string;
  userId: string;
  venueName: string;
  /** dd/MM/yyyy – same string format used by Project I */
  bookingDate: string;
  /** "09:00 AM" */
  startTime: string;
  endTime: string;
  startTimeMinutes: number;
  endTimeMinutes: number;
  /** epoch millis (Firestore Timestamp in the Firebase backend) */
  createdAt: number;
  purpose: string;
  attendees: number;
  requirements?: string;
}

/** Project II: separate student / staff accounts */
export type UserType = 'Student' | 'Staff';

/** Anything that is not exactly "staff" (any case) is treated as a student – old Project I accounts included. */
export const normalizeRole = (v?: string | null): UserType =>
  (v ?? '').trim().toLowerCase() === 'staff' ? 'Staff' : 'Student';

export interface UserProfile {
  uid: string;
  fullName: string;
  studentId: string;
  email: string;
  userType: string; // "Student" | "Staff" ("Student" for every Project I account)
  /** Project II: profile picture as a small JPEG data-URI (stored in the user document) */
  photoBase64?: string;
}

/** Fields a user may change from the Edit Profile screen. */
export type ProfilePatch = Partial<Pick<UserProfile, 'fullName' | 'studentId' | 'photoBase64'>>;

export interface AuthUser {
  uid: string;
  email: string;
}

export type NewBooking = Omit<Booking, 'id'>;
