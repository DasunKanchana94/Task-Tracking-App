import { describe, expect, it } from "vitest";

import {
  clampMinutes,
  minutesToY,
  snapMinutes,
  yToMinutes,
} from "@/features/time-blocks/lib/time-grid";

describe("time-grid", () => {
  it("converts minutes to pixels and back", () => {
    expect(minutesToY(60)).toBe(120);
    expect(yToMinutes(120)).toBe(60);
  });

  it("snaps minutes to the nearest 15-minute increment", () => {
    expect(snapMinutes(7)).toBe(0);
    expect(snapMinutes(8)).toBe(15);
    expect(snapMinutes(22)).toBe(15);
    expect(snapMinutes(23)).toBe(30);
  });

  it("clamps minutes to a single day", () => {
    expect(clampMinutes(-10)).toBe(0);
    expect(clampMinutes(1500)).toBe(1440);
    expect(clampMinutes(600)).toBe(600);
  });
});
