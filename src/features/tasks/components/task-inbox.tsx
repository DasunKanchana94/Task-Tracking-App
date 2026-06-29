"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Inbox } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/features/tasks/components/priority-badge";
import type { TaskDto } from "@/features/tasks/lib/serialize";
import { useTasks } from "@/features/tasks/lib/use-tasks";

function InboxItem({ task }: { task: TaskDto }) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: `task:${task.id}`,
    data: { task },
  });

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={transform ? { transform: CSS.Translate.toString(transform), zIndex: 50 } : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-sm",
        "cursor-grab touch-none select-none",
        isDragging && "relative opacity-40",
      )}
    >
      <GripVertical className="text-muted-foreground size-3.5 shrink-0" />
      <span className="flex-1 truncate">
        {task.emoji ? `${task.emoji} ` : ""}
        {task.title}
      </span>
      <PriorityBadge priority={task.priority} />
    </li>
  );
}

export function TaskInbox() {
  const { data: tasks, isLoading } = useTasks();
  const unscheduled = (tasks ?? []).filter((task) => task.status !== "completed" && task.status !== "cancelled");

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase">
        <Inbox className="size-3.5" />
        Inbox
      </h2>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      )}

      {!isLoading && unscheduled.length === 0 && (
        <p className="text-muted-foreground text-sm">No unscheduled tasks.</p>
      )}

      {!isLoading && unscheduled.length > 0 && (
        <ul className="flex flex-col gap-2">
          {unscheduled.map((task) => (
            <InboxItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}
