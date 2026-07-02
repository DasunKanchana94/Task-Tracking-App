"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DndContext } from "@dnd-kit/core";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type CalendarView, isCalendarView, shiftDate } from "@/features/calendar/lib/date-ranges";
import { MiniCalendar } from "@/features/calendar/components/mini-calendar";
import { WeekView } from "@/features/calendar/components/week-view";
import { MonthView } from "@/features/calendar/components/month-view";
import { DailyTimeline } from "@/features/time-blocks/components/daily-timeline";
import { BlockEditDialog } from "@/features/time-blocks/components/block-edit-dialog";
import { TaskDetailDialog } from "@/features/tasks/components/task-detail-dialog";
import type { TimeBlockDto } from "@/features/time-blocks/lib/serialize";
import { useTasks } from "@/features/tasks/lib/use-tasks";

const VIEWS: { id: CalendarView; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

function parseDateParam(value: string | null): Date {
  if (!value) return new Date();
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function CalendarBoard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: tasks } = useTasks();

  const [selectedBlock, setSelectedBlock] = useState<TimeBlockDto | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  const viewParam = searchParams.get("view");
  const view: CalendarView = isCalendarView(viewParam) ? viewParam : "day";
  const date = parseDateParam(searchParams.get("date"));

  function handleOpenBlock(block: TimeBlockDto) {
    setSelectedBlock(block);
    if (block.task?.id) {
      setTaskDialogOpen(true);
    } else {
      setBlockDialogOpen(true);
    }
  }

  const selectedTask = selectedBlock?.task?.id
    ? (tasks?.find((t) => t.id === selectedBlock.task!.id) ?? null)
    : null;

  function navigate(nextView: CalendarView, nextDate: Date) {
    const params = new URLSearchParams();
    params.set("view", nextView);
    params.set("date", format(nextDate, "yyyy-MM-dd"));
    router.push(`/calendar?${params.toString()}`);
  }

  return (
    <div className="flex flex-1 gap-4">
      <aside className="flex w-56 shrink-0 flex-col gap-4">
        <MiniCalendar date={date} onSelect={(day) => navigate(view, day)} />
      </aside>

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" aria-label="Previous" onClick={() => navigate(view, shiftDate(view, date, -1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => navigate(view, new Date())}>
              Today
            </Button>
            <Button type="button" variant="outline" size="icon" aria-label="Next" onClick={() => navigate(view, shiftDate(view, date, 1))}>
              <ChevronRight className="size-4" />
            </Button>
            <span className="text-sm font-medium">
              {view === "month" ? format(date, "MMMM yyyy") : format(date, "MMMM d, yyyy")}
            </span>
          </div>

          <div className="flex gap-1 rounded-md border p-1">
            {VIEWS.map((v) => (
              <Button
                key={v.id}
                type="button"
                size="sm"
                variant={v.id === view ? "default" : "ghost"}
                className={cn("h-7")}
                onClick={() => navigate(v.id, date)}
                data-testid={`calendar-view-${v.id}`}
              >
                {v.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-md border">
          {view === "day" && (
            <DndContext>
              <DailyTimeline date={date} onOpenBlock={handleOpenBlock} />
            </DndContext>
          )}
          {view === "week" && <WeekView date={date} onSelectDay={(day) => navigate("day", day)} />}
          {view === "month" && <MonthView date={date} onSelectDay={(day) => navigate("day", day)} />}
        </div>
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
      />
      <BlockEditDialog
        block={selectedBlock}
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
      />
    </div>
  );
}
