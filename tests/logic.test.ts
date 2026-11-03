import assert from 'assert';
import { createMockBackend } from '../src/backend/mockBackend';
import { saveBooking } from '../src/services/bookingService';
import { validateTimeRange, hasConflict, filterBookingsByTab, shortBookingId } from '../src/utils/bookingLogic';
import { formatTime, formatDate, parseDate } from '../src/utils/time';
import { getVenueCapacity, isExclusive, filterVenues } from '../src/utils/venueUtils';
import { SEED_VENUES } from '../src/backend/seedVenues';

let n = 0; const ok = (name: string, f: () => void | Promise<void>) => Promise.resolve(f()).then(() => { n++; console.log('✓', name); });

(async () => {
  await ok('formatTime matches Kotlin', () => {
    assert.equal(formatTime(0, 5), '12:05 AM'); assert.equal(formatTime(9, 0), '09:00 AM');
    assert.equal(formatTime(12, 0), '12:00 PM'); assert.equal(formatTime(13, 30), '01:30 PM'); assert.equal(formatTime(22, 0), '10:00 PM');
  });
  await ok('date format/parse', () => {
    assert.equal(formatDate(new Date(2026, 9, 5)), '05/10/2026');
    assert.equal(parseDate('05/10/2026')!.getMonth(), 9); assert.equal(parseDate('31/02/2026'), null); assert.equal(parseDate('abc'), null);
  });
  await ok('time range validation', () => {
    assert.match(validateTimeRange(null, null)!, /both/);
    assert.match(validateTimeRange({hour:8,minute:59},{hour:10,minute:0})!, /Start time/);
    assert.match(validateTimeRange({hour:9,minute:0},{hour:22,minute:1})!, /End time must be between/);
    assert.match(validateTimeRange({hour:10,minute:0},{hour:10,minute:0})!, /after start/);
    assert.equal(validateTimeRange({hour:9,minute:0},{hour:22,minute:0}), null);
  });
  await ok('overlap rule (touching slots allowed)', () => {
    const ex = [{ id: 'a', startTimeMinutes: 600, endTimeMinutes: 720 }];
    assert.equal(hasConflict(ex, 660, 780), true);   // overlaps tail
    assert.equal(hasConflict(ex, 540, 601), true);   // overlaps head
    assert.equal(hasConflict(ex, 610, 700), true);   // inside
    assert.equal(hasConflict(ex, 540, 780), true);   // contains
    assert.equal(hasConflict(ex, 720, 780), false);  // back-to-back after
    assert.equal(hasConflict(ex, 540, 600), false);  // back-to-back before
    assert.equal(hasConflict(ex, 600, 720, 'a'), false); // editing itself
  });
  await ok('capacity + exclusive rules', () => {
    const v = (name: string) => ({ id: '', name, location: '', description: '', category: '', capacity: 0 });
    assert.equal(getVenueCapacity(v('Conventional Hall')), 900); assert.equal(getVenueCapacity(v('LH Hall')), 150);
    assert.equal(getVenueCapacity(v('Enterprise Hall')), 30); assert.equal(getVenueCapacity(v('Indoor Tennis Court')), 8);
    assert.equal(getVenueCapacity(v('Mystery Room')), 50); assert.equal(getVenueCapacity({ ...v('Mystery Room'), capacity: 70 }), 70);
    assert.equal(isExclusive(v('Enterprise Hall')), true); assert.equal(isExclusive(v('LH Hall')), false);
  });
  await ok('search by name or location', () => {
    const vs = SEED_VENUES.map((x, i) => ({ id: String(i), ...x }));
    assert.equal(filterVenues(vs, 'volley').length, 2); assert.equal(filterVenues(vs, 'indoor sports').length, 3); assert.equal(filterVenues(vs, 'zzz').length, 0); assert.equal(filterVenues(vs, '').length, 10);
  });

  // ---- full flow on mock backend with in-memory storage
  const mem = new Map<string, string>();
  const kv = { getItem: async (k: string) => mem.get(k) ?? null, setItem: async (k: string, v: string) => void mem.set(k, v), removeItem: async (k: string) => void mem.delete(k) };
  const be = createMockBackend(kv, 0);
  let events: (string | null)[] = []; be.auth.onAuthChange((u) => events.push(u?.uid ?? null));
  await new Promise((r) => setTimeout(r, 20));

  await ok('startup emits signed-out', () => assert.deepEqual(events, [null]));
  await ok('register validations', async () => {
    await assert.rejects(be.auth.register({ fullName: 'A', studentId: '1', email: 'bad', password: '123456' }), /badly formatted/);
    await assert.rejects(be.auth.register({ fullName: 'A', studentId: '1', email: 'a@b.com', password: '123' }), /at least 6/);
  });
  const { user, profile } = await be.auth.register({ fullName: 'Kunzang Lhamo', studentId: '02240161', email: 'k@cst.bt', password: 'secret1' });
  await ok('register creates Student profile + session', () => { assert.equal(profile.userType, 'Student'); assert.equal(profile.studentId, '02240161'); });
  await ok('duplicate email rejected', async () => assert.rejects(be.auth.register({ fullName: 'X', studentId: '2', email: 'K@cst.bt', password: 'secret1' }), /already in use/));
  await be.auth.signOut();
  await ok('wrong password rejected', async () => assert.rejects(be.auth.signIn('k@cst.bt', 'nope'), /incorrect/));
  await be.auth.signIn('k@cst.bt', 'secret1');

  const venues = await be.venues.list();
  const hall = venues.find((v) => v.name === 'Conventional Hall')!;
  const today = formatDate(new Date());
  const base = { userId: user.uid, venue: hall, date: today, purpose: 'Debate', attendeesText: '50' };

  await ok('seeded booking blocks overlap (10:00-12:00)', async () => {
    const r = await saveBooking(be, { ...base, startTime: '11:00 AM', endTime: '01:00 PM', startTimeMinutes: 660, endTimeMinutes: 780 });
    assert.deepEqual(r, { ok: false, error: 'Venue already booked or overlaps for this time range' });
  });
  await ok('capacity exceeded', async () => {
    const r = await saveBooking(be, { ...base, attendeesText: '901', startTime: '01:00 PM', endTime: '02:00 PM', startTimeMinutes: 780, endTimeMinutes: 840 });
    assert.deepEqual(r, { ok: false, error: 'Capacity exceeded! Maximum allowed is 900' });
  });
  await ok('empty attendees / purpose', async () => {
    const s = { startTime: '01:00 PM', endTime: '02:00 PM', startTimeMinutes: 780, endTimeMinutes: 840 };
    assert.equal((await saveBooking(be, { ...base, ...s, attendeesText: ' ' }) as any).error, 'Please enter number of attendees');
    assert.equal((await saveBooking(be, { ...base, ...s, purpose: '  ' }) as any).error, 'Please enter purpose of booking');
  });
  let id = '';
  await ok('create booking (touching slot ok)', async () => {
    const r = await saveBooking(be, { ...base, startTime: '12:00 PM', endTime: '01:00 PM', startTimeMinutes: 720, endTimeMinutes: 780 });
    assert.equal(r.ok, true); id = (r as any).id;
  });
  await ok('first-come-first-served: same slot now rejected', async () => {
    const r = await saveBooking(be, { ...base, startTime: '12:30 PM', endTime: '01:30 PM', startTimeMinutes: 750, endTimeMinutes: 810 });
    assert.equal(r.ok, false);
  });
  await ok('edit own booking (no self-conflict) updates', async () => {
    const r = await saveBooking(be, { ...base, purpose: 'Debate finals', editBookingId: id, startTime: '12:00 PM', endTime: '02:00 PM', startTimeMinutes: 720, endTimeMinutes: 840 });
    assert.deepEqual(r, { ok: true, id, updated: true });
    assert.equal((await be.bookings.get(id))!.purpose, 'Debate finals');
  });
  await ok('My Bookings only shows own, newest first', async () => {
    const mine = await be.bookings.listByUser(user.uid); assert.equal(mine.length, 1); assert.equal(mine[0].id, id);
  });
  await ok('upcoming/past tab split', () => {
    const mk = (d: Date) => ({ ...(({} as any)), bookingDate: formatDate(d) });
    const now = new Date(2026, 9, 26, 15, 0);
    const list: any[] = [mk(new Date(2026, 9, 26)), mk(new Date(2026, 9, 27)), mk(new Date(2026, 9, 25)), { bookingDate: 'garbage' }];
    assert.equal(filterBookingsByTab(list, 0, now).length, 3); // today, tomorrow, unparsable
    assert.equal(filterBookingsByTab(list, 1, now).length, 1); // yesterday
  });
  await ok('cancel removes booking', async () => { await be.bookings.remove(id); assert.equal(await be.bookings.get(id), null); assert.equal(shortBookingId('abcdefghijkl'), '#GHIJKL'); });
  console.log(`\n${n} checks passed`);
})().catch((e) => { console.error('✗ FAILED', e); process.exit(1); });
