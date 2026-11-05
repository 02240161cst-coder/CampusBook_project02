import assert from 'assert';
import { createMockBackend } from '../src/backend/mockBackend';
import { saveBooking } from '../src/services/bookingService';
import { validateTimeRange, hasConflict, filterBookingsByTab, shortBookingId, isUpcoming } from '../src/utils/bookingLogic';
import { formatTime, formatDate, parseDate } from '../src/utils/time';
import { getVenueCapacity, isExclusive, filterVenues } from '../src/utils/venueUtils';
import { SEED_VENUES } from '../src/backend/seedVenues';
import { computeReminderDate } from '../src/utils/reminder';
import { canBookVenue } from '../src/utils/venueUtils';
import { normalizeRole } from '../src/types';
import { formatLongDate } from '../src/utils/time';

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
    await assert.rejects(be.auth.register({ fullName: 'A', studentId: '1', email: 'bad', password: '123456', userType: 'Student' as const }), /badly formatted/);
    await assert.rejects(be.auth.register({ fullName: 'A', studentId: '1', email: 'a@b.com', password: '123', userType: 'Student' as const }), /at least 6/);
  });
  const { user, profile } = await be.auth.register({ fullName: 'Kunzang Lhamo', studentId: '02240161', email: 'k@cst.bt', password: 'secret1', userType: 'Student' as const });
  await ok('register creates Student profile + session', () => { assert.equal(profile.userType, 'Student'); assert.equal(profile.studentId, '02240161'); });
  await ok('duplicate email rejected', async () => assert.rejects(be.auth.register({ fullName: 'X', studentId: '2', email: 'K@cst.bt', password: 'secret1', userType: 'Student' as const }), /already in use/));
  await be.auth.signOut();
  await ok('wrong password rejected', async () => assert.rejects(be.auth.signIn('k@cst.bt', 'nope'), /incorrect/));
  await be.auth.signIn('k@cst.bt', 'secret1');

  const venues = await be.venues.list();
  const hall = venues.find((v) => v.name === 'Conventional Hall')!;
  const today = formatDate(new Date());
  const at8 = new Date(); at8.setHours(8, 0, 0, 0);
  const base = { now: at8, userId: user.uid, userType: 'Student' as const, venue: hall, date: today, purpose: 'Debate', attendeesText: '50' };

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
  await ok('Past/Upcoming switch at the END TIME, not at midnight', () => {
    const now = new Date(2026, 9, 26, 15, 0); // Mon 26 Oct, 3:00 PM
    const mk = (d: Date, endMin: number) => ({ bookingDate: formatDate(d), endTimeMinutes: endMin } as any);
    const todayLate = mk(new Date(2026, 9, 26), 17 * 60);   // ends 5 PM  → still upcoming
    const todayDone = mk(new Date(2026, 9, 26), 10 * 60);   // ends 10 AM → past
    const justEnded = mk(new Date(2026, 9, 26), 15 * 60);   // ends exactly now → past
    const tomorrow = mk(new Date(2026, 9, 27), 9 * 60 + 60);
    const yesterday = mk(new Date(2026, 9, 25), 22 * 60);
    const junk = { bookingDate: 'garbage', endTimeMinutes: 0 } as any;
    const list = [todayLate, todayDone, justEnded, tomorrow, yesterday, junk];
    assert.deepEqual(filterBookingsByTab(list, 0, now), [todayLate, tomorrow, junk]);
    assert.deepEqual(filterBookingsByTab(list, 1, now), [todayDone, justEnded, yesterday]);
    assert.equal(isUpcoming(todayLate, new Date(2026, 9, 26, 17, 0)), false); // flips at 5:00 PM sharp
    assert.equal(isUpcoming(todayLate, new Date(2026, 9, 26, 16, 59)), true);
    assert.equal(isUpcoming({ bookingDate: '26/10/2026', endTimeMinutes: 0 } as any, new Date(2026, 9, 26, 23, 0)), true); // no end time → end of day
  });
  await ok('cannot choose a time that has already passed today', () => {
    const now = new Date(2026, 9, 26, 11, 30); const today = new Date(2026, 9, 26); const t = (h: number, m = 0) => ({ hour: h, minute: m });
    assert.match(validateTimeRange(t(9), t(10), today, now)!, /already passed/);       // the reported bug: 9–10 AM at 11:30
    assert.match(validateTimeRange(t(11, 29), t(12), today, now)!, /already passed/);
    assert.equal(validateTimeRange(t(11, 30), t(12), today, now), null);               // starting right now is fine
    assert.equal(validateTimeRange(t(14), t(15), today, now), null);
    assert.equal(validateTimeRange(t(9), t(10), new Date(2026, 9, 27), now), null);    // tomorrow 9 AM is fine
    assert.match(validateTimeRange(t(14), t(15), new Date(2026, 9, 25), now)!, /date that has already passed/);
  });
  await ok('service also rejects past slots (cannot be bypassed from the UI)', async () => {
    const now = new Date(); now.setHours(15, 0, 0, 0);
    const r = await saveBooking(be, { ...base, now, startTime: '09:00 AM', endTime: '10:00 AM', startTimeMinutes: 540, endTimeMinutes: 600 });
    assert.equal(r.ok, false); assert.match((r as any).error, /already passed/);
  });
  await ok('cancel removes booking', async () => { await be.bookings.remove(id); assert.equal(await be.bookings.get(id), null); assert.equal(shortBookingId('abcdefghijkl'), '#GHIJKL'); });

  // ================= Project II =================
  console.log('\n-- Project II --');
  await ok('role normalisation (old accounts = Student)', () => {
    assert.equal(normalizeRole(undefined), 'Student'); assert.equal(normalizeRole('Student'), 'Student');
    assert.equal(normalizeRole('staff'), 'Staff'); assert.equal(normalizeRole(' STAFF '), 'Staff');
  });
  const ent = venues.find((v) => v.name === 'Enterprise Hall')!;
  await ok('students cannot book staff-only venue (rule + service)', async () => {
    assert.equal(canBookVenue(ent, 'Student'), false); assert.equal(canBookVenue(ent, 'Staff'), true); assert.equal(canBookVenue(hall, 'Student'), true);
    const slot = { date: today, startTime: '02:00 PM', endTime: '03:00 PM', startTimeMinutes: 840, endTimeMinutes: 900, attendeesText: '5', purpose: 'Meeting' };
    const r = await saveBooking(be, { now: at8, userId: user.uid, userType: 'Student', venue: ent, ...slot });
    assert.deepEqual(r, { ok: false, error: 'This venue can only be booked by staff accounts' });
    const r2 = await saveBooking(be, { now: at8, userId: user.uid, userType: 'Staff', venue: ent, ...slot });
    assert.equal(r2.ok, true);
  });
  await ok('register as Staff stores role', async () => {
    const r = await be.auth.register({ fullName: 'Tashi', studentId: 'ST-9', email: 'tashi@cst.bt', password: 'secret1', userType: 'Staff' });
    assert.equal(r.profile.userType, 'Staff'); assert.equal((await be.users.get(r.user.uid))!.userType, 'Staff');
    await be.auth.signOut(); await be.auth.signIn('k@cst.bt', 'secret1');
  });
  await ok('edit profile: name, id and photo persist', async () => {
    const upd = await be.users.update(user.uid, { fullName: 'Kunzang L.', studentId: '02240162', photoBase64: 'data:image/jpeg;base64,AAAA' });
    assert.equal(upd.fullName, 'Kunzang L.'); assert.equal(upd.photoBase64, 'data:image/jpeg;base64,AAAA'); assert.equal(upd.email, 'k@cst.bt'); assert.equal(upd.userType, 'Student');
    assert.equal(((await be.users.get(user.uid)) as any).password, undefined, 'password must never be returned');
    const cleared = await be.users.update(user.uid, { photoBase64: '' }); assert.equal(cleared.photoBase64, '');
  });
  await ok('calendar: listAll returns every user\'s bookings, filter by date', async () => {
    const all = await be.bookings.listAll(); const day = all.filter((b) => b.bookingDate === today);
    assert.ok(all.some((b) => b.userId === 'seed-user')); assert.ok(day.length >= 2);
    assert.ok(new Set(all.map((b) => b.bookingDate)).has(today));
    const sorted = [...day].sort((a, b) => a.startTimeMinutes - b.startTimeMinutes);
    assert.ok(sorted[0].startTimeMinutes <= sorted[sorted.length - 1].startTimeMinutes);
  });
  await ok('long date label', () => assert.equal(formatLongDate(new Date(2026, 9, 26)), 'Mon, 26 Oct 2026'));
  await ok('reminder is 60 min before start; none if already past', () => {
    const now = new Date(2026, 9, 26, 8, 0);
    const r = computeReminderDate('26/10/2026', 600, 60, now)!;        // 10:00 start → 09:00
    assert.equal(r.getHours(), 9); assert.equal(r.getMinutes(), 0); assert.equal(r.getDate(), 26);
    assert.equal(computeReminderDate('26/10/2026', 9 * 60, 60, now), null); // 09:00 start, now 08:00 → reminder time is 'now' → skip
    assert.equal(computeReminderDate('26/10/2026', 9 * 60, 60, new Date(2026, 9, 26, 7, 0))!.getHours(), 8); // earlier in the day → 08:00
    assert.equal(computeReminderDate('26/10/2026', 530, 60, now), null); // 08:50 start → reminder 07:50 is past
    assert.equal(computeReminderDate('25/10/2026', 600, 60, now), null); // yesterday
    assert.equal(computeReminderDate('bad', 600, 60, now), null);
    const next = computeReminderDate('27/10/2026', 570, 60, now)!;       // 09:30 → 08:30 next day
    assert.equal(next.getDate(), 27); assert.equal(next.getHours(), 8); assert.equal(next.getMinutes(), 30);
  });
  console.log(`\n${n} checks passed`);
})().catch((e) => { console.error('✗ FAILED', e); process.exit(1); });
