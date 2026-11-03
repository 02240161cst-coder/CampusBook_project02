export const pad = (n: number) => String(n).padStart(2, '0');

/** Same output as SelectDateActivity.formatTime → "09:05 AM" */
export function formatTime(hour: number, minute: number): string {
  const amPm = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${pad(displayHour)}:${pad(minute)} ${amPm}`;
}

/** dd/MM/yyyy */
export function formatDate(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Parses dd/MM/yyyy (local midnight). Returns null if invalid. */
export function parseDate(s: string): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((s || '').trim());
  if (!m) return null;
  const day = +m[1], month = +m[2], year = +m[3];
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
