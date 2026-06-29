"use client";

import { useState } from "react";
import { eachDayOfInterval, format, isSameDay, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMonthGridRange } from "@/features/calendar/lib/date-ranges";

export function MiniCalendar({ date, onSelect }: { date: Date; onSelect: (day: Date) => void }) {
  const [cursor, setCursor] = useState(date);
  const { from, to } = getMonthGridRange(cursor);
  const days = eachDayOfInterval({ start: from, end: to });
  const today = new Date();

  return (
    <div className="w-56 rounded-md border p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{format(cursor, "MMMM yyyy")}</span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label="Previous month"
            onClick={() => setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6"
            aria-label="Next month"
            onClick={() => setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
        {["M", "T", "W", "T", "F", "S", "S"].map((label, i) => (
          <span key={i} className="text-muted-foreground py-1">
            {label}
          </span>
        ))}

        {days.map((day) => (
          <button
            key={day.toISOString()}
            type="button"
            onClick={() => onSelect(day)}
            className={cn(
              "rounded-full py-1 hover:bg-accent",
              !isSameMonth(day, cursor) && "text-muted-foreground/40",
              isSameDay(day, date) && "bg-primary text-primary-foreground hover:bg-primary",
              isSameDay(day, today) && !isSameDay(day, date) && "text-primary font-semibold",
            )}
          >
            {format(day, "d")}
          </button>
        ))}
      </div>
    </div>
  );
}
