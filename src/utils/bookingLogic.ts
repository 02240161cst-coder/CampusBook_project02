import { Booking } from '../types';
import { formatDate, parseDate } from './time';

export const OPEN_MINUTES = 9 * 60; //  09:00 AM
export const CLOSE_MINUTES = 22 * 60; // 10:00 PM

export interface HM { hour: number; minute: number }

/** Port of SelectDateActivity.validateTimeRange – returns an error message or null. */
export function validateTimeRange(start: HM | null, end: HM | null): string | null {
  if (!start || !end) return 'Please select both start and end time';
  const s = start.hour * 60 + start.minute;
  const e = end.hour * 60 + end.minute;
  if (s < OPEN_MINUTES || s > CLOSE_MINUTES) return 'Start time must be between 09:00 AM and 10:00 PM';
  if (e < OPEN_MINUTES || e > CLOSE_MINUTES) return 'End time must be between 09:00 AM and 10:00 PM';
  if (e <= s) return 'End time must be after start time';
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

/** Port of MyBookingsFragment.filterBookings – "Upcoming" tab. */
export function isUpcoming(b: Booking, now: Date = new Date()): boolean {
  const d = parseDate(b.bookingDate);
  if (!d) return true;
  return d.getTime() > now.getTime() || b.bookingDate === formatDate(now);
}

/** Port of MyBookingsFragment.filterBookings – "Past" tab. */
export function isPast(b: Booking, now: Date = new Date()): boolean {
  const d = parseDate(b.bookingDate);
  if (!d) return false;
  return d.getTime() < now.getTime() && b.bookingDate !== formatDate(now);
}

export function filterBookingsByTab(all: Booking[], tab: 0 | 1, now: Date = new Date()): Booking[] {
  return all.filter((b) => (tab === 0 ? isUpcoming(b, now) : isPast(b, now)));
}

/** "#A1B2C3" – last 6 chars of the document id, as in ManageBookingActivity. */
export const shortBookingId = (id: string) => `#${id.slice(-6).toUpperCase()}`;
