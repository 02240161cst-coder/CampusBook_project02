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

export interface UserProfile {
  uid: string;
  fullName: string;
  studentId: string;
  email: string;
  userType: string; // "Student" by default, same as Project I
}

export interface AuthUser {
  uid: string;
  email: string;
}

export type NewBooking = Omit<Booking, 'id'>;
