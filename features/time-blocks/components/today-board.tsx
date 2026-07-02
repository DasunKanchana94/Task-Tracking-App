"use client";

import { useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

import { DailyTimeline } from "@/features/time-blocks/components/daily-timeline";
import { BlockEditDialog } from "@/features/time-blocks/components/block-edit-dialog";
import { TaskInbox } from "@/features/tasks/components/task-inbox";
import { TaskDetailDialog } from "@/features/tasks/components/task-detail-dialog";
import type { TimeBlockDto } from "@/features/time-blocks/lib/serialize";
import { useTasks } from "@/features/tasks/lib/use-tasks";

export function TodayBoard({ date }: { date: Date }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const { data: tasks } = useTasks();

  const [selectedBlock, setSelectedBlock] = useState<TimeBlockDto | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

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

  return (
    <DndContext sensors={sensors}>
      <div className="flex flex-1 gap-4">
        <aside className="w-56 shrink-0">
          <TaskInbox />
        </aside>

        <div className="max-h-[70vh] flex-1 overflow-y-auto rounded-md border">
          <DailyTimeline date={date} onOpenBlock={handleOpenBlock} />
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
    </DndContext>
  );
}
