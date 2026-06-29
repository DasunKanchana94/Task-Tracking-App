"use client";

import { addUtcDays, dateKey, utcMidnight } from "@/features/habits/lib/streak";

const WEEKS = 18;

export function HabitHeatmap({
  loggedDates,
  color,
  onToggle,
}: {
  loggedDates: string[];
  color: string | null;
  onToggle?: (date: string) => void;
}) {
  const logged = new Set(loggedDates);
  const today = utcMidnight(new Date());
  const todayDay = today.getUTCDay();
  const daysSinceMonday = (todayDay + 6) % 7;
  const gridStart = addUtcDays(today, -daysSinceMonday - (WEEKS - 1) * 7);

  const weeks = Array.from({ length: WEEKS }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => addUtcDays(gridStart, weekIndex * 7 + dayIndex)),
  );

  const fill = color ?? "#16a34a";

  return (
    <div className="flex gap-1 overflow-x-auto pb-1" data-testid="habit-heatmap">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-1">
          {week.map((day) => {
            const key = dateKey(day);
            const isLogged = logged.has(key);
            const isFuture = day.getTime() > today.getTime();
            return (
              <button
                key={key}
                type="button"
                aria-label={`${key}${isLogged ? " (logged)" : ""}`}
                data-testid={`habit-heatmap-day-${key}`}
                disabled={isFuture || !onToggle}
                onClick={() => onToggle?.(key)}
                className="size-3 rounded-sm border border-transparent disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isLogged ? fill : "var(--muted)",
                  opacity: isFuture ? 0.3 : 1,
                }}
                title={key}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
