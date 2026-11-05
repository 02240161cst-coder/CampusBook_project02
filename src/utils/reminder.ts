import { parseDate } from './time';

/** How long before a booking starts the reminder notification fires. */
export const REMINDER_LEAD_MINUTES = 60;

/**
 * When should the "upcoming booking" reminder fire?
 * Returns null when that moment is already in the past (nothing to schedule).
 */
export function computeReminderDate(
  bookingDate: string,
  startTimeMinutes: number,
  leadMinutes: number = REMINDER_LEAD_MINUTES,
  now: Date = new Date(),
): Date | null {
  const day = parseDate(bookingDate);
  if (!day) return null;
  // minutes > 59 are normalised by Date, e.g. 09:00 − 60 min → 08:00
  const when = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, startTimeMinutes - leadMinutes, 0, 0);
  return when.getTime() > now.getTime() + 5000 ? when : null;
}
