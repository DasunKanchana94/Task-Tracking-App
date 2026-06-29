export type HabitFrequency = "daily" | "weekdays" | "weekly";

export function utcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function isApplicableDay(frequency: HabitFrequency, date: Date): boolean {
  if (frequency === "weekly") return true;
  if (frequency === "daily") return true;
  const day = date.getUTCDay();
  return day >= 1 && day <= 5;
}

/**
 * Daily/weekdays: walk backward from `today`, counting consecutive
 * applicable days that have a log, skipping inapplicable days (e.g.
 * weekends for a "weekdays" habit). The streak is current if either
 * today or the most recent applicable day before today is logged.
 */
function computeDayStreak(frequency: HabitFrequency, logDateKeys: Set<string>, today: Date) {
  let cursor = utcMidnight(today);
  let current = 0;

  if (isApplicableDay(frequency, cursor) && !logDateKeys.has(dateKey(cursor))) {
    cursor = addUtcDays(cursor, -1);
  }

  for (let guard = 0; guard < 3650; guard++) {
    if (!isApplicableDay(frequency, cursor)) {
      cursor = addUtcDays(cursor, -1);
      continue;
    }
    if (!logDateKeys.has(dateKey(cursor))) break;
    current += 1;
    cursor = addUtcDays(cursor, -1);
  }

  return current;
}

function computeWeeklyStreak(logDateKeys: Set<string>, targetDaysPerWeek: number, today: Date) {
  const startOfWeek = (date: Date) => {
    const day = date.getUTCDay();
    const diff = (day + 6) % 7; // days since Monday
    return addUtcDays(utcMidnight(date), -diff);
  };

  const countLogsInWeek = (weekStart: Date) => {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      if (logDateKeys.has(dateKey(addUtcDays(weekStart, i)))) count += 1;
    }
    return count;
  };

  let cursor = startOfWeek(today);
  if (countLogsInWeek(cursor) < targetDaysPerWeek) {
    cursor = addUtcDays(cursor, -7);
  }

  let current = 0;
  for (let guard = 0; guard < 520; guard++) {
    if (countLogsInWeek(cursor) < targetDaysPerWeek) break;
    current += 1;
    cursor = addUtcDays(cursor, -7);
  }

  return current;
}

export function computeCurrentStreak(
  frequency: HabitFrequency,
  targetDaysPerWeek: number | null,
  logDates: Date[],
  today: Date = new Date(),
): number {
  const logDateKeys = new Set(logDates.map((date) => dateKey(date)));

  if (frequency === "weekly") {
    return computeWeeklyStreak(logDateKeys, targetDaysPerWeek ?? 1, today);
  }

  return computeDayStreak(frequency, logDateKeys, today);
}

export function computeLongestStreak(
  frequency: HabitFrequency,
  targetDaysPerWeek: number | null,
  logDates: Date[],
): number {
  if (logDates.length === 0) return 0;

  const logDateKeys = new Set(logDates.map((date) => dateKey(date)));
  const sorted = [...logDateKeys].sort();
  const earliest = utcMidnight(new Date(sorted[0] as string));
  const latest = utcMidnight(new Date(sorted[sorted.length - 1] as string));

  if (frequency === "weekly") {
    const target = targetDaysPerWeek ?? 1;
    let longest = 0;
    let cursor = earliest;
    while (cursor.getTime() <= latest.getTime()) {
      const streak = computeWeeklyStreak(logDateKeys, target, cursor);
      longest = Math.max(longest, streak);
      cursor = addUtcDays(cursor, 7);
    }
    return longest;
  }

  let longest = 0;
  let cursor = earliest;
  while (cursor.getTime() <= latest.getTime()) {
    const streak = computeDayStreak(frequency, logDateKeys, cursor);
    longest = Math.max(longest, streak);
    cursor = addUtcDays(cursor, 1);
  }
  return longest;
}
