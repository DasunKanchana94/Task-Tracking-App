"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCompleteTask, useCreateTask, useDeleteTask, useSubtasks } from "@/features/tasks/lib/use-tasks";

export function SubtaskList({ parentTaskId }: { parentTaskId: string }) {
  const { data: subtasks } = useSubtasks(parentTaskId);
  const createTask = useCreateTask();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const [title, setTitle] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createTask.mutate({ title: trimmed, parentTaskId }, { onSuccess: () => setTitle("") });
  }

  return (
    <div className="grid gap-2">
      <ul className="flex flex-col gap-1">
        {(subtasks ?? []).map((subtask) => (
          <li key={subtask.id} className="group flex items-center gap-2 rounded-md px-1 py-1">
            <Checkbox
              checked={subtask.status === "completed"}
              onCheckedChange={(checked) =>
                completeTask.mutate({ id: subtask.id, completed: checked === true })
              }
              aria-label={subtask.status === "completed" ? "Mark subtask incomplete" : "Mark subtask complete"}
            />
            <span
              className={cn(
                "flex-1 truncate text-sm",
                subtask.status === "completed" && "text-muted-foreground line-through",
              )}
            >
              {subtask.title}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100"
              aria-label="Delete subtask"
              onClick={() => deleteTask.mutate(subtask.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a subtask..."
          aria-label="New subtask title"
          disabled={createTask.isPending}
        />
        <Button type="submit" size="sm" disabled={createTask.isPending || !title.trim()}>
          {createTask.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        </Button>
      </form>
    </div>
  );
}
