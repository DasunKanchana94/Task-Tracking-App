"use client";

import { differenceInMinutes, eachDayOfInterval, format, isSameDay, parseISO } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";
import { getWeekRange } from "@/features/calendar/lib/date-ranges";
import { useTimeBlocks } from "@/features/time-blocks/lib/use-time-blocks";
import { HOUR_HEIGHT, minutesToY } from "@/features/time-blocks/lib/time-grid";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

export function WeekView({ date, onSelectDay }: { date: Date; onSelectDay: (day: Date) => void }) {
  const { from, to } = getWeekRange(date);
  const days = eachDayOfInterval({ start: from, end: to });
  const { data: blocks, isLoading, isError } = useTimeBlocks({ from: from.toISOString(), to: to.toISOString() });

  if (isLoading) {
    return (
      <div className="grid gap-1 p-4">
        {HOURS.slice(0, 6).map((hour) => (
          <Skeleton key={hour} className="h-[60px] w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-destructive p-4 text-sm">Failed to load the week.</p>;
  }

  const today = new Date();

  return (
    <div className="flex">
      <div className="flex flex-col text-right">
        <div className="h-10" />
        {HOURS.map((hour) => (
          <div key={hour} className="text-muted-foreground pr-2 text-xs" style={{ height: HOUR_HEIGHT }}>
            {format(new Date(2000, 0, 1, hour), "h a")}
          </div>
        ))}
      </div>

      {days.map((day) => {
        const dayBlocks = (blocks ?? []).filter((block) => isSameDay(parseISO(block.startAt), day));
        return (
          <div key={day.toISOString()} className="relative flex-1 border-l">
            <button
              type="button"
              onClick={() => onSelectDay(day)}
              className={
                "flex h-10 w-full flex-col items-center justify-center border-b text-xs hover:bg-accent" +
                (isSameDay(day, today) ? " text-primary font-semibold" : " text-muted-foreground")
              }
            >
              <span>{format(day, "EEE")}</span>
              <span>{format(day, "d")}</span>
            </button>

            <div className="relative">
              {HOURS.map((hour) => (
                <div key={hour} className="pointer-events-none border-b" style={{ height: HOUR_HEIGHT }} />
              ))}

              {dayBlocks.map((block) => {
                const start = parseISO(block.startAt);
                const end = parseISO(block.endAt);
                const startMinutes = differenceInMinutes(start, day);
                const endMinutes = differenceInMinutes(end, day);
                return (
                  <div
                    key={block.id}
                    className="bg-primary/10 border-primary/30 absolute right-1 left-1 overflow-hidden rounded-md border px-1.5 py-1 text-xs"
                    style={{
                      top: minutesToY(startMinutes),
                      height: Math.max(minutesToY(endMinutes - startMinutes), 18),
                      backgroundColor: block.color ? `${block.color}22` : undefined,
                      borderColor: block.color ?? undefined,
                    }}
                  >
                    <p className="truncate font-medium">{block.title ?? block.task?.title ?? "Untitled block"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
