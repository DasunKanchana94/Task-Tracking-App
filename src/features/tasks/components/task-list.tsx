"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { CreateTaskBar } from "@/features/tasks/components/create-task-bar";
import { TaskDetailDialog } from "@/features/tasks/components/task-detail-dialog";
import { TaskListItem } from "@/features/tasks/components/task-list-item";
import type { TaskDto } from "@/features/tasks/lib/serialize";
import { useTasks } from "@/features/tasks/lib/use-tasks";

export function TaskList() {
  const { data: tasks, isLoading, isError } = useTasks();
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <CreateTaskBar />

      {isLoading && (
        <div className="flex flex-col gap-2" data-testid="tasks-skeleton">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-destructive text-sm">Failed to load tasks. Please refresh and try again.</p>
      )}

      {!isLoading && !isError && tasks && tasks.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-12 text-center">
          <ClipboardList className="text-muted-foreground size-8" />
          <p className="text-muted-foreground text-sm">No tasks yet. Add your first one above.</p>
        </div>
      )}

      {!isLoading && !isError && tasks && tasks.length > 0 && (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskListItem key={task.id} task={task} onOpen={setSelectedTask} />
          ))}
        </ul>
      )}

      <TaskDetailDialog
        task={selectedTask}
        open={selectedTask !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTask(null);
        }}
      />
    </div>
  );
}
