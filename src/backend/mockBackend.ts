import { AuthUser, Booking, NewBooking, UserProfile, Venue } from '../types';
import { formatDate } from '../utils/time';
import { Backend, BackendError } from './types';
import { SEED_VENUES } from './seedVenues';

/** Minimal key-value storage (AsyncStorage satisfies this). */
export interface KV {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

interface StoredUser extends UserProfile { password: string }

const K = { users: 'cb_users', bookings: 'cb_bookings', session: 'cb_session' };
const rid = () =>
  Array.from({ length: 20 }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join('');

/**
 * Local demo backend. Behaves like Firebase (same validation messages,
 * persisted sign-in, per-user bookings) but stores everything on-device.
 */
export function createMockBackend(storage: KV, latencyMs = 250): Backend {
  const wait = () => new Promise<void>((r) => setTimeout(r, latencyMs));
  const listeners = new Set<(u: AuthUser | null) => void>();

  async function read<T>(key: string, fallback: T): Promise<T> {
    const raw = await storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  }
  const write = (key: string, v: unknown) => storage.setItem(key, JSON.stringify(v));

  /** One pre-existing booking so the conflict check can be seen straight away. */
  async function ensureSeed() {
    const existing = await storage.getItem(K.bookings);
    if (existing) return;
    const today = formatDate(new Date());
    const seed: Booking[] = [
      {
        id: rid(), userId: 'seed-user', venueName: 'Conventional Hall', bookingDate: today,
        startTime: '10:00 AM', endTime: '12:00 PM', startTimeMinutes: 600, endTimeMinutes: 720,
        createdAt: Date.now() - 86400000, purpose: 'Orientation rehearsal', attendees: 120,
      },
    ];
    await write(K.bookings, seed);
  }

  const emit = (u: AuthUser | null) => listeners.forEach((l) => l(u));
  const toAuthUser = (u: StoredUser): AuthUser => ({ uid: u.uid, email: u.email });

  return {
    auth: {
      onAuthChange(cb) {
        listeners.add(cb);
        (async () => {
          await ensureSeed();
          const uid = await storage.getItem(K.session);
          const users = await read<StoredUser[]>(K.users, []);
          const u = users.find((x) => x.uid === uid);
          cb(u ? toAuthUser(u) : null);
        })();
        return () => { listeners.delete(cb); };
      },

      async signIn(email, password) {
        await wait();
        const users = await read<StoredUser[]>(K.users, []);
        const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
        if (!u || u.password !== password)
          throw new BackendError('The supplied auth credential is incorrect, malformed or has expired.');
        await storage.setItem(K.session, u.uid);
        emit(toAuthUser(u));
        return toAuthUser(u);
      },

      async register({ fullName, studentId, email, password, userType }) {
        await wait();
        if (!/^\S+@\S+\.\S+$/.test(email)) throw new BackendError('The email address is badly formatted.');
        if (password.length < 6)
          throw new BackendError('The given password is invalid. [ Password should be at least 6 characters ]');
        const users = await read<StoredUser[]>(K.users, []);
        if (users.some((x) => x.email.toLowerCase() === email.toLowerCase()))
          throw new BackendError('The email address is already in use by another account.');
        const u: StoredUser = {
          uid: rid(), fullName, studentId, email, userType, password,
        };
        await write(K.users, [...users, u]);
        await storage.setItem(K.session, u.uid);
        const { password: _pw, ...profile } = u;
        // NOTE: like Firebase, sign-in state changes right after the account is created.
        emit(toAuthUser(u));
        return { user: toAuthUser(u), profile };
      },

      async signOut() {
        await storage.removeItem(K.session);
        emit(null);
      },
    },

    users: {
      async get(uid) {
        const users = await read<StoredUser[]>(K.users, []);
        const u = users.find((x) => x.uid === uid);
        if (!u) return null;
        const { password: _pw, ...profile } = u;
        return profile;
      },
      async update(uid, patch) {
        await wait();
        const users = await read<StoredUser[]>(K.users, []);
        const next = users.map((x) => (x.uid === uid ? { ...x, ...patch } : x));
        await write(K.users, next);
        const u = next.find((x) => x.uid === uid);
        if (!u) throw new BackendError('User not found');
        const { password: _pw, ...profile } = u;
        return profile;
      },
    },

    venues: {
      async list() {
        await wait();
        return SEED_VENUES.map((v, i): Venue => ({ id: `venue-${i + 1}`, ...v }));
      },
    },

    bookings: {
      async listByUser(uid) {
        await wait();
        const all = await read<Booking[]>(K.bookings, []);
        return all.filter((b) => b.userId === uid).sort((a, b) => b.createdAt - a.createdAt);
      },
      async listAll() {
        await wait();
        return read<Booking[]>(K.bookings, []);
      },
      async get(id) {
        const all = await read<Booking[]>(K.bookings, []);
        return all.find((b) => b.id === id) ?? null;
      },
      async listForVenueDate(venueName, bookingDate) {
        const all = await read<Booking[]>(K.bookings, []);
        return all.filter((b) => b.venueName === venueName && b.bookingDate === bookingDate);
      },
      async create(data: NewBooking) {
        await wait();
        const all = await read<Booking[]>(K.bookings, []);
        const id = rid();
        await write(K.bookings, [...all, { ...data, id }]);
        return id;
      },
      async update(id, patch) {
        await wait();
        const all = await read<Booking[]>(K.bookings, []);
        await write(K.bookings, all.map((b) => (b.id === id ? { ...b, ...patch } : b)));
      },
      async remove(id) {
        await wait();
        const all = await read<Booking[]>(K.bookings, []);
        await write(K.bookings, all.filter((b) => b.id !== id));
      },
    },
  };
}
