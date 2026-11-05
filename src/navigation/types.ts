import { Venue } from '../types';

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Calendar: undefined;
  Bookings: undefined;
  Profile: undefined;
};

/** Params carried through the booking flow (same extras as Project I's Intents). */
export interface EditParams {
  bookingId?: string;
  isEdit?: boolean;
  purpose?: string;
  attendees?: number;
  requirements?: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: { screen?: keyof TabParamList } | undefined;
  VenueDetails: { venue: Venue };
  SelectDate: { venue: Venue } & EditParams;
  BookingDetails: {
    venue: Venue;
    date: string;
    startTime: string;
    endTime: string;
    startTimeMinutes: number;
    endTimeMinutes: number;
  } & EditParams;
  BookingConfirm: { venueName: string; date: string; timeSlot: string };
  ManageBooking: { bookingId: string };
  Settings: undefined;
  EditProfile: undefined;
};
