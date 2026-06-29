import type { Habit, HabitLog } from "@prisma/client";

import { computeCurrentStreak, computeLongestStreak, dateKey } from "@/features/habits/lib/streak";

export type HabitDto = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  frequency: Habit["frequency"];
  targetDaysPerWeek: number | null;
  archivedAt: string | null;
  currentStreak: number;
  longestStreak: number;
  loggedDates: string[];
  createdAt: string;
  updatedAt: string;
};

export function toHabitDto(habit: Habit & { logs: HabitLog[] }): HabitDto {
  const logDates = habit.logs.map((log) => log.date);
  return {
    id: habit.id,
    name: habit.name,
    emoji: habit.emoji,
    color: habit.color,
    frequency: habit.frequency,
    targetDaysPerWeek: habit.targetDaysPerWeek,
    archivedAt: habit.archivedAt?.toISOString() ?? null,
    currentStreak: computeCurrentStreak(habit.frequency, habit.targetDaysPerWeek, logDates),
    longestStreak: computeLongestStreak(habit.frequency, habit.targetDaysPerWeek, logDates),
    loggedDates: logDates.map((date) => dateKey(date)).sort(),
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
  };
}
