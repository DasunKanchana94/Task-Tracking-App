import { describe, expect, it } from "vitest";

import { getMonthGridRange, getWeekRange, shiftDate } from "@/features/calendar/lib/date-ranges";

describe("date-ranges", () => {
  it("computes a Monday-start week range", () => {
    const wednesday = new Date(2026, 5, 17); // June 17 2026 is a Wednesday
    const { from, to } = getWeekRange(wednesday);
    expect(from.getDay()).toBe(1);
    expect(to.getDay()).toBe(0);
  });

  it("computes a full-grid month range padded to week boundaries", () => {
    const { from, to } = getMonthGridRange(new Date(2026, 5, 17));
    expect(from.getDay()).toBe(1);
    expect(to.getDay()).toBe(0);
    expect(from.getTime()).toBeLessThanOrEqual(new Date(2026, 5, 1).getTime());
    expect(to.getTime()).toBeGreaterThanOrEqual(new Date(2026, 5, 30).getTime());
  });

  it("shifts dates by view granularity", () => {
    const base = new Date(2026, 5, 17);
    expect(shiftDate("day", base, 1).getDate()).toBe(18);
    expect(shiftDate("week", base, 1).getDate()).toBe(24);
    expect(shiftDate("month", base, 1).getMonth()).toBe(6);
    expect(shiftDate("month", base, -1).getMonth()).toBe(4);
  });
});
