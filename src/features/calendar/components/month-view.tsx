"use client";

import { eachDayOfInterval, format, isSameDay, isSameMonth, parseISO } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getMonthGridRange } from "@/features/calendar/lib/date-ranges";
import { useTimeBlocks } from "@/features/time-blocks/lib/use-time-blocks";

const MAX_VISIBLE_BLOCKS = 3;

export function MonthView({ date, onSelectDay }: { date: Date; onSelectDay: (day: Date) => void }) {
  const { from, to } = getMonthGridRange(date);
  const days = eachDayOfInterval({ start: from, end: to });
  const { data: blocks, isLoading, isError } = useTimeBlocks({ from: from.toISOString(), to: to.toISOString() });

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-1 p-4">
        {Array.from({ length: 35 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-destructive p-4 text-sm">Failed to load the month.</p>;
  }

  const today = new Date();

  return (
    <div className="grid grid-cols-7">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
        <div key={label} className="text-muted-foreground border-b py-1 text-center text-xs font-medium">
          {label}
        </div>
      ))}

      {days.map((day) => {
        const dayBlocks = (blocks ?? [])
          .filter((block) => isSameDay(parseISO(block.startAt), day))
          .sort((a, b) => a.startAt.localeCompare(b.startAt));
        const overflow = dayBlocks.length - MAX_VISIBLE_BLOCKS;

        return (
          <button
            key={day.toISOString()}
            type="button"
            onClick={() => onSelectDay(day)}
            className={cn(
              "flex h-24 flex-col items-stretch gap-0.5 border-b border-r p-1 text-left text-xs hover:bg-accent",
              !isSameMonth(day, date) && "text-muted-foreground/50 bg-muted/30",
            )}
          >
            <span className={cn("self-end px-1", isSameDay(day, today) && "rounded-full bg-primary text-primary-foreground")}>
              {format(day, "d")}
            </span>
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              {dayBlocks.slice(0, MAX_VISIBLE_BLOCKS).map((block) => (
                <span
                  key={block.id}
                  className="bg-primary/10 border-primary/30 truncate rounded border px-1"
                  style={{
                    backgroundColor: block.color ? `${block.color}22` : undefined,
                    borderColor: block.color ?? undefined,
                  }}
                >
                  {block.title ?? block.task?.title ?? "Untitled block"}
                </span>
              ))}
              {overflow > 0 && <span className="text-muted-foreground px-1">+{overflow} more</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}
