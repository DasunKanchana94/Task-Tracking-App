"use client";

import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/features/tasks/components/priority-badge";
import { ProgressRing } from "@/features/tasks/components/progress-ring";
import type { TaskDto } from "@/features/tasks/lib/serialize";
import { useCompleteTask } from "@/features/tasks/lib/use-tasks";

export function TaskListItem({ task, onOpen }: { task: TaskDto; onOpen: (task: TaskDto) => void }) {
  const completeTask = useCompleteTask();
  const isCompleted = task.status === "completed";
  const dueDate = task.dueDate ? parseISO(task.dueDate) : null;

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 transition-colors hover:bg-accent/50",
      )}
    >
      <Checkbox
        checked={isCompleted}
        onCheckedChange={(checked) =>
          completeTask.mutate({ id: task.id, completed: checked === true })
        }
        aria-label={isCompleted ? "Mark task incomplete" : "Mark task complete"}
      />

      <button
        type="button"
        onClick={() => onOpen(task)}
        className="flex flex-1 items-center justify-between gap-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          {task.subtaskCount && task.subtaskCount.total > 0 && (
            <ProgressRing completed={task.subtaskCount.completed} total={task.subtaskCount.total} />
          )}
          <span className={cn("truncate text-sm", isCompleted && "text-muted-foreground line-through")}>
            {task.emoji ? `${task.emoji} ` : ""}
            {task.title}
          </span>
          {task.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" style={{ borderColor: tag.color ?? undefined }} className="shrink-0">
              {tag.name}
            </Badge>
          ))}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {dueDate && isValid(dueDate) && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <CalendarIcon className="size-3" />
              {format(dueDate, "MMM d")}
            </span>
          )}
          <PriorityBadge priority={task.priority} />
        </span>
      </button>
    </li>
  );
}
