import { Venue, UserType } from '../types';

/** Port of VenueUtils.getVenueCapacity – Firestore capacity is only a fallback. */
export function getVenueCapacity(venue: Venue): number {
  const name = venue.name.toLowerCase().trim();
  if (name.includes('conventional')) return 900;
  if (name.includes('lh hall')) return 150;
  if (name.includes('smart classroom')) return 100;
  if (name.includes('enterprise')) return 30;
  if (name.includes('football')) return 35;
  if (name.includes('basketball')) return 20;
  if (name.includes('volleyball')) return 15;
  if (name.includes('badminton')) return 10;
  if (name.includes('tennis')) return 8;
  return venue.capacity > 0 ? venue.capacity : 50;
}

/** Port of VenueUtils.isExclusive – "Staff Level Only" venues. */
export function isExclusive(venue: Venue): boolean {
  return venue.name.toLowerCase().includes('enterprise');
}

/** Search used by Home + Explore: name or location, case-insensitive. */
export function filterVenues(venues: Venue[], query: string): Venue[] {
  const q = query.trim().toLowerCase();
  if (!q) return venues;
  return venues.filter(
    (v) => v.name.toLowerCase().includes(q) || (v.location || '').toLowerCase().includes(q),
  );
}

/** Project II role rule: "Staff Level Only" venues can only be booked by staff accounts. */
export function canBookVenue(venue: Venue, role: UserType): boolean {
  return !isExclusive(venue) || role === 'Staff';
}
