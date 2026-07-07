const IST = "Asia/Kolkata";
const LOCALE = "en-US";

function fmt(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(LOCALE, { timeZone: IST, ...opts }).format(
    new Date(date)
  );
}

/** "Jan 15, 2024" */
export function formatDate(date: Date | string | number): string {
  return fmt(date, { month: "short", day: "numeric", year: "numeric" });
}

/** "January 15, 2024" */
export function formatLongDate(date: Date | string | number): string {
  return fmt(date, { month: "long", day: "numeric", year: "numeric" });
}

/** "Mon, Jan 15" */
export function formatShortDate(date: Date | string | number): string {
  return fmt(date, { weekday: "short", month: "short", day: "numeric" });
}

/** "Monday, January 15" */
export function formatLongDayDate(date: Date | string | number): string {
  return fmt(date, { weekday: "long", month: "long", day: "numeric" });
}

/** "Jan 15, 2:30 PM" */
export function formatDateTime(date: Date | string | number): string {
  return fmt(date, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** "Jan 15, 2024, 2:30 PM" */
export function formatDateTimeLong(date: Date | string | number): string {
  return fmt(date, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** "2:30 PM" */
export function formatTime(date: Date | string | number): string {
  return fmt(date, { hour: "numeric", minute: "2-digit", hour12: true });
}

/** "Mon" */
export function formatWeekday(date: Date | string | number): string {
  return fmt(date, { weekday: "short" });
}

/** "Jan" */
export function formatMonth(date: Date | string | number): string {
  return fmt(date, { month: "short" });
}

/** "Jan 15" */
export function formatDayMonth(date: Date | string | number): string {
  return fmt(date, { month: "short", day: "numeric" });
}

/** "Jan 2024" */
export function formatMonthYear(date: Date | string | number): string {
  return fmt(date, { month: "short", year: "numeric" });
}

/** "2024-01-15" — for HTML date input fields and API submissions */
export function formatISODate(date: Date | string | number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(date));
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

// ── IST-aware booking validation ─────────────────────────────────────────────

/** Minutes before the current IST time within which slots cannot be booked */
export const BOOKING_BUFFER_MINUTES = 30;

interface ISTComponents {
  year: number;
  month: number; // 1-based
  day: number;
  hours: number;
  minutes: number;
}

/** Extract date/time components in IST from any Date value */
export function getDateComponentsIST(date: Date | string | number): ISTComponents {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(date));
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return {
    year: get("year"),
    month: get("month"),       // 1-based
    day: get("day"),
    hours: get("hour") % 24,  // Intl may emit 24 for midnight
    minutes: get("minute"),
  };
}

/** "YYYY-MM-DD" string for today in IST — use for date comparisons */
export function getTodayISODateIST(): string {
  return formatISODate(new Date());
}

/** True if the given IST calendar date (year, 1-based month, day) is strictly before today in IST */
export function isDateInPastIST(year: number, month: number, day: number): boolean {
  const t = getDateComponentsIST(new Date());
  if (year !== t.year) return year < t.year;
  if (month !== t.month) return month < t.month;
  return day < t.day;
}

/** True if the given IST calendar date matches today in IST */
export function isDateTodayIST(year: number, month: number, day: number): boolean {
  const t = getDateComponentsIST(new Date());
  return year === t.year && month === t.month && day === t.day;
}

/** Parse a time-slot string like "9:00 AM" or "2:30 PM" into minutes since midnight */
export function parseSlotToMinutes(slot: string): number {
  const [time, period] = slot.split(" ");
  const [hStr, mStr] = time.split(":");
  let h = Number(hStr);
  const m = Number(mStr);
  if (period === "PM" && h !== 12) h += 12;
  else if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/**
 * True if the slot for the given IST date has already passed (including buffer).
 * Returns false for any future date so this is safe to call unconditionally.
 */
export function isSlotPastIST(
  year: number,
  month: number, // 1-based
  day: number,
  slot: string
): boolean {
  if (isDateInPastIST(year, month, day)) return true;
  if (!isDateTodayIST(year, month, day)) return false;
  const t = getDateComponentsIST(new Date());
  return parseSlotToMinutes(slot) <= t.hours * 60 + t.minutes + BOOKING_BUFFER_MINUTES;
}

/** Convenience: checks whether a slot is past for a given Date object (timezone-safe) */
export function isSlotPastForDate(date: Date, slot: string): boolean {
  const { year, month, day } = getDateComponentsIST(date);
  return isSlotPastIST(year, month, day, slot);
}
