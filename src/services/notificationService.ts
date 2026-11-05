/**
 * Booking notifications (Project II).
 *
 *  • Booking confirmed / updated / cancelled → shown immediately
 *  • Upcoming-booking reminder → scheduled 1 hour before the start time
 *
 * These are LOCAL notifications: they work in Expo Go and offline, and need no
 * server. (Remote push from a server would need a development build – see the
 * guide.) The user can switch them off in Settings → Notifications.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Booking } from '../types';
import { isUpcoming } from '../utils/bookingLogic';
import { computeReminderDate, REMINDER_LEAD_MINUTES } from '../utils/reminder';

const PREF_KEY = 'cb_notifications_enabled';
const MAP_KEY = 'cb_reminder_ids'; // { [bookingId]: scheduledNotificationId }
const CHANNEL_ID = 'bookings';

type ReminderInfo = Pick<Booking, 'id' | 'venueName' | 'bookingDate' | 'startTime' | 'startTimeMinutes'>;
type ShownInfo = Pick<Booking, 'venueName' | 'bookingDate' | 'startTime' | 'endTime'>;

/** Call once when the app starts. */
export async function initNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () =>
      ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }) as any,
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Booking updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });
  }
}

/** Asks the OS for permission (only shows the dialog if it has not been answered yet). */
export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function isEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(PREF_KEY);
  return v !== 'false'; // default: on
}

export async function setEnabled(on: boolean): Promise<boolean> {
  await AsyncStorage.setItem(PREF_KEY, on ? 'true' : 'false');
  if (on) return ensurePermission();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(MAP_KEY);
  return true;
}

async function canNotify(): Promise<boolean> {
  if (!(await isEnabled())) return false;
  const p = await Notifications.getPermissionsAsync();
  return p.granted;
}

const trigger = (extra: object = {}) =>
  (Platform.OS === 'android' ? { channelId: CHANNEL_ID, ...extra } : { ...extra }) as any;

async function showNow(title: string, body: string) {
  if (!(await canNotify())) return;
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: Platform.OS === 'android' ? trigger() : null,
  });
}

const describe = (b: ShownInfo) => `${b.venueName} · ${b.bookingDate}, ${b.startTime} - ${b.endTime}`;

export const notifyBookingConfirmed = (b: ShownInfo) => showNow('Booking confirmed ✅', describe(b));
export const notifyBookingUpdated = (b: ShownInfo) => showNow('Booking updated ✏️', describe(b));
export const notifyBookingCancelled = (b: ShownInfo) => showNow('Booking cancelled ❌', describe(b));

// ───────────────────────── reminders ─────────────────────────

async function loadMap(): Promise<Record<string, string>> {
  try {
    return JSON.parse((await AsyncStorage.getItem(MAP_KEY)) ?? '{}');
  } catch {
    return {};
  }
}
const saveMap = (m: Record<string, string>) => AsyncStorage.setItem(MAP_KEY, JSON.stringify(m));

export async function cancelReminder(bookingId: string): Promise<void> {
  const map = await loadMap();
  const id = map[bookingId];
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    delete map[bookingId];
    await saveMap(map);
  }
}

/** (Re)schedules the reminder for one booking. */
export async function scheduleReminder(b: ReminderInfo): Promise<void> {
  await cancelReminder(b.id);
  if (!(await canNotify())) return;
  const when = computeReminderDate(b.bookingDate, b.startTimeMinutes, REMINDER_LEAD_MINUTES);
  if (!when) return; // starts in less than an hour (or already past)
  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upcoming booking ⏰',
      body: `${b.venueName} starts at ${b.startTime} (in ${REMINDER_LEAD_MINUTES} minutes).`,
    },
    trigger: trigger({ type: 'date', date: when }),
  });
  const map = await loadMap();
  map[b.id] = notifId;
  await saveMap(map);
}

/**
 * Keeps reminders in step with the user's bookings (e.g. bookings made on another phone,
 * or after re-installing). Safe to call often – it only schedules what is missing.
 */
export async function syncReminders(bookings: Booking[]): Promise<void> {
  if (!(await canNotify())) return;
  const map = await loadMap();
  const ids = new Set(bookings.map((b) => b.id));

  for (const id of Object.keys(map)) {
    if (!ids.has(id)) await cancelReminder(id); // booking was cancelled elsewhere
  }
  const fresh = await loadMap();
  for (const b of bookings) {
    if (!fresh[b.id] && isUpcoming(b)) await scheduleReminder(b);
  }
}
