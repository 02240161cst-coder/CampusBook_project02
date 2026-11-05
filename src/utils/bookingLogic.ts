import { Booking } from '../types';
import { parseDate, startOfDay } from './time';

export const OPEN_MINUTES = 9 * 60; //  09:00 AM
export const CLOSE_MINUTES = 22 * 60; // 10:00 PM

export interface HM { hour: number; minute: number }

/**
 * Port of SelectDateActivity.validateTimeRange – returns an error message or null.
 * Project II fix: when `date` is today, a start time that has already passed is rejected
 * (and any earlier day is rejected too).
 */
export function validateTimeRange(
  start: HM | null,
  end: HM | null,
  date?: Date,
  now: Date = new Date(),
): string | null {
  if (!start || !end) return 'Please select both start and end time';
  const s = start.hour * 60 + start.minute;
  const e = end.hour * 60 + end.minute;
  if (s < OPEN_MINUTES || s > CLOSE_MINUTES) return 'Start time must be between 09:00 AM and 10:00 PM';
  if (e < OPEN_MINUTES || e > CLOSE_MINUTES) return 'End time must be between 09:00 AM and 10:00 PM';
  if (e <= s) return 'End time must be after start time';
  return pastSlotError(date, s, now);
}

/** "This time has already passed" check shared by the screen and the booking service. */
export function pastSlotError(date: Date | undefined, startMinutes: number, now: Date = new Date()): string | null {
  if (!date) return null;
  const day = startOfDay(date).getTime();
  const today = startOfDay(now).getTime();
  if (day < today) return 'You cannot book a date that has already passed';
  if (day === today && startMinutes < now.getHours() * 60 + now.getMinutes())
    return 'This time has already passed. Please choose a later start time';
  return null;
}

/**
 * Port of the overlap rule in BookingDetailsActivity.checkAndSaveBooking:
 *   startM < existingEnd && endM > existingStart
 * (back-to-back bookings, e.g. 10–11 then 11–12, are allowed.)
 * `excludeId` lets an edit ignore the booking being edited.
 */
export function hasConflict(
  existing: Pick<Booking, 'id' | 'startTimeMinutes' | 'endTimeMinutes'>[],
  startM: number,
  endM: number,
  excludeId?: string | null,
): boolean {
  return existing.some((b) => {
    if (excludeId && b.id === excludeId) return false;
    return startM < b.endTimeMinutes && endM > b.startTimeMinutes;
  });
}

/** The moment a booking finishes (date + end time). null if the date cannot be read. */
function bookingEnd(b: Pick<Booking, 'bookingDate' | 'endTimeMinutes'>): Date | null {
  const d = parseDate(b.bookingDate);
  if (!d) return null;
  const endMin = b.endTimeMinutes > 0 ? b.endTimeMinutes : 24 * 60; // unknown end → end of day
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, endMin, 0, 0);
}

/**
 * "Upcoming" tab. Project II: a booking stays upcoming until its END TIME passes
 * (Project I kept it upcoming until midnight).
 */
export function isUpcoming(b: Booking, now: Date = new Date()): boolean {
  const end = bookingEnd(b);
  if (!end) return true;
  return end.getTime() > now.getTime();
}

/** "Past" tab – exactly the bookings that are no longer upcoming (unreadable dates stay upcoming). */
export function isPast(b: Booking, now: Date = new Date()): boolean {
  const end = bookingEnd(b);
  if (!end) return false;
  return end.getTime() <= now.getTime();
}

export function filterBookingsByTab(all: Booking[], tab: 0 | 1, now: Date = new Date()): Booking[] {
  return all.filter((b) => (tab === 0 ? isUpcoming(b, now) : isPast(b, now)));
}

/** "#A1B2C3" – last 6 chars of the document id, as in ManageBookingActivity. */
export const shortBookingId = (id: string) => `#${id.slice(-6).toUpperCase()}`;
