import { Backend } from '../backend/types';
import { Booking, UserType, Venue } from '../types';
import { hasConflict, pastSlotError } from '../utils/bookingLogic';
import { parseDate } from '../utils/time';
import { canBookVenue, getVenueCapacity } from '../utils/venueUtils';

export interface SaveBookingInput {
  userId: string;
  /** Project II: role of the signed-in user */
  userType: UserType;
  venue: Venue;
  date: string;
  startTime: string;
  endTime: string;
  startTimeMinutes: number;
  endTimeMinutes: number;
  attendeesText: string;
  purpose: string;
  requirements?: string;
  /** set when editing an existing booking */
  editBookingId?: string | null;
  /** only for tests – defaults to the current time */
  now?: Date;
}

export type SaveResult = { ok: true; id: string; updated: boolean } | { ok: false; error: string };

/**
 * Port of BookingDetailsActivity.validateAndSave → checkAndSaveBooking →
 * performBooking / performUpdate:
 *   0. (Project II) staff-only venues can only be booked by staff
 *   1. validate attendees + purpose + capacity
 *   2. read every booking for that venue+date and reject any time overlap
 *      (first-come-first-served; the booking being edited is ignored)
 *   3. create or update the booking
 */
export async function saveBooking(backend: Backend, i: SaveBookingInput): Promise<SaveResult> {
  if (!canBookVenue(i.venue, i.userType))
    return { ok: false, error: 'This venue can only be booked by staff accounts' };

  const slotError = pastSlotError(parseDate(i.date) ?? undefined, i.startTimeMinutes, i.now ?? new Date());
  if (slotError) return { ok: false, error: slotError };

  const attendeesStr = i.attendeesText.trim();
  if (!attendeesStr) return { ok: false, error: 'Please enter number of attendees' };
  const attendees = parseInt(attendeesStr, 10);
  if (!Number.isFinite(attendees) || attendees < 1)
    return { ok: false, error: 'Please enter a valid number of attendees' };
  if (!i.purpose.trim()) return { ok: false, error: 'Please enter purpose of booking' };

  const maxCapacity = getVenueCapacity(i.venue);
  if (attendees > maxCapacity)
    return { ok: false, error: `Capacity exceeded! Maximum allowed is ${maxCapacity}` };

  let existing: Booking[];
  try {
    existing = await backend.bookings.listForVenueDate(i.venue.name, i.date);
  } catch (e: any) {
    return { ok: false, error: `Verification failed: ${e.message}` };
  }
  if (hasConflict(existing, i.startTimeMinutes, i.endTimeMinutes, i.editBookingId))
    return { ok: false, error: 'Venue already booked or overlaps for this time range' };

  try {
    if (i.editBookingId) {
      await backend.bookings.update(i.editBookingId, {
        bookingDate: i.date,
        startTime: i.startTime,
        endTime: i.endTime,
        startTimeMinutes: i.startTimeMinutes,
        endTimeMinutes: i.endTimeMinutes,
        purpose: i.purpose.trim(),
        attendees,
        requirements: (i.requirements ?? '').trim(),
      });
      return { ok: true, id: i.editBookingId, updated: true };
    }
    const id = await backend.bookings.create({
      userId: i.userId,
      venueName: i.venue.name,
      bookingDate: i.date,
      startTime: i.startTime,
      endTime: i.endTime,
      startTimeMinutes: i.startTimeMinutes,
      endTimeMinutes: i.endTimeMinutes,
      createdAt: Date.now(),
      purpose: i.purpose.trim(),
      attendees,
      requirements: (i.requirements ?? '').trim(),
    });
    return { ok: true, id, updated: false };
  } catch (e: any) {
    return { ok: false, error: `${i.editBookingId ? 'Update' : 'Booking'} failed: ${e.message}` };
  }
}
