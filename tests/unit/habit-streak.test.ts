import { describe, expect, it } from "vitest";

import { computeCurrentStreak, computeLongestStreak } from "@/features/habits/lib/streak";

function days(strings: string[]) {
  return strings.map((s) => new Date(`${s}T00:00:00.000Z`));
}

describe("computeCurrentStreak", () => {
  it("counts 5 consecutive daily check-ins ending today", () => {
    const today = new Date("2026-07-05T00:00:00.000Z");
    const logs = days(["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"]);
    expect(computeCurrentStreak("daily", null, logs, today)).toBe(5);
  });

  it("still counts the streak if today hasn't been logged yet but yesterday was", () => {
    const today = new Date("2026-07-05T00:00:00.000Z");
    const logs = days(["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04"]);
    expect(computeCurrentStreak("daily", null, logs, today)).toBe(4);
  });

  it("resets to 0 when there is a gap before today", () => {
    const today = new Date("2026-07-05T00:00:00.000Z");
    const logs = days(["2026-07-01", "2026-07-02"]);
    expect(computeCurrentStreak("daily", null, logs, today)).toBe(0);
  });

  it("skips weekends for a weekdays habit", () => {
    // Mon 2026-06-29 .. Fri 2026-07-03, then Mon 2026-07-06 (today)
    const today = new Date("2026-07-06T00:00:00.000Z");
    const logs = days([
      "2026-06-29",
      "2026-06-30",
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
      "2026-07-06",
    ]);
    expect(computeCurrentStreak("weekdays", null, logs, today)).toBe(6);
  });

  it("counts weekly streaks by target days per week", () => {
    // Week of 2026-06-29 (Mon) - 3 logs, week of 2026-07-06 - 3 logs
    const today = new Date("2026-07-08T00:00:00.000Z");
    const logs = days(["2026-06-29", "2026-07-01", "2026-07-03", "2026-07-06", "2026-07-07", "2026-07-08"]);
    expect(computeCurrentStreak("weekly", 3, logs, today)).toBe(2);
  });
});

describe("computeLongestStreak", () => {
  it("finds the longest run even if it's not the current streak", () => {
    const logs = days([
      "2026-06-20",
      "2026-06-21",
      "2026-06-22",
      "2026-06-23",
      "2026-07-05",
    ]);
    expect(computeLongestStreak("daily", null, logs)).toBe(4);
  });

  it("returns 0 for no logs", () => {
    expect(computeLongestStreak("daily", null, [])).toBe(0);
  });
});
