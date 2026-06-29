"use client";

import { useEffect, useState } from "react";

import { minutesToY } from "@/features/time-blocks/lib/time-grid";

export function NowLine() {
  const [minutesSinceMidnight, setMinutesSinceMidnight] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      setMinutesSinceMidnight(now.getHours() * 60 + now.getMinutes());
    }
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (minutesSinceMidnight === null) return null;

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-10 flex items-center"
      style={{ top: minutesToY(minutesSinceMidnight) }}
      aria-label="Current time"
    >
      <span className="size-2 -translate-x-1 rounded-full bg-red-500" />
      <span className="h-px flex-1 bg-red-500" />
    </div>
  );
}
