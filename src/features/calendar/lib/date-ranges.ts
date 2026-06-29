import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";

export type CalendarView = "day" | "week" | "month";

export function isCalendarView(value: string | null): value is CalendarView {
  return value === "day" || value === "week" || value === "month";
}

export function getDayRange(date: Date) {
  return { from: startOfDay(date), to: endOfDay(date) };
}

export function getWeekRange(date: Date) {
  return {
    from: startOfWeek(date, { weekStartsOn: 1 }),
    to: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getMonthGridRange(date: Date) {
  return {
    from: startOfWeek(startOfMonth(date), { weekStartsOn: 1 }),
    to: endOfWeek(endOfMonth(date), { weekStartsOn: 1 }),
  };
}

export function getRangeForView(view: CalendarView, date: Date) {
  if (view === "day") return getDayRange(date);
  if (view === "week") return getWeekRange(date);
  return getMonthGridRange(date);
}

export function shiftDate(view: CalendarView, date: Date, direction: 1 | -1) {
  if (view === "day") return addDays(date, direction);
  if (view === "week") return direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1);
  return direction === 1 ? addMonths(date, 1) : subMonths(date, 1);
}
