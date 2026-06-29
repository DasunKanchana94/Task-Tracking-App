import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Calendar",
};

import { CalendarBoard } from "@/features/calendar/components/calendar-board";

export default function CalendarPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground text-sm">Browse your schedule by day, week, or month.</p>
      </div>

      <Suspense fallback={<div className="flex-1" />}>
        <CalendarBoard />
      </Suspense>
    </div>
  );
}
