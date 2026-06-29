"use client";

import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

import { DailyTimeline } from "@/features/time-blocks/components/daily-timeline";
import { TaskInbox } from "@/features/tasks/components/task-inbox";

export function TodayBoard({ date }: { date: Date }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  return (
    <DndContext sensors={sensors}>
      <div className="flex flex-1 gap-4">
        <aside className="w-56 shrink-0">
          <TaskInbox />
        </aside>

        <div className="max-h-[70vh] flex-1 overflow-y-auto rounded-md border">
          <DailyTimeline date={date} />
        </div>
      </div>
    </DndContext>
  );
}
