"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubtaskList } from "@/features/tasks/components/subtask-list";
import type { TaskDto } from "@/features/tasks/lib/serialize";
import { useDeleteTask, useUpdateTask } from "@/features/tasks/lib/use-tasks";
import { TagPicker } from "@/features/tags/components/tag-picker";

const PRIORITY_OPTIONS = [
  { value: "0", label: "None" },
  { value: "1", label: "Low" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
  { value: "4", label: "Urgent" },
];

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: {
  task: TaskDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(String(task.priority));
    setDueDate(task.dueDate ?? "");
    setTagIds(task.tags.map((tag) => tag.id));
  }, [task]);

  if (!task) return null;

  function handleSave() {
    if (!task) return;
    updateTask.mutate(
      {
        id: task.id,
        payload: {
          title: title.trim(),
          description: description.trim() || undefined,
          priority: Number(priority),
          dueDate: dueDate || null,
          tagIds,
          updatedAt: task.updatedAt,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  function handleDelete() {
    if (!task) return;
    deleteTask.mutate(task.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="task-priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tags</Label>
            <TagPicker selectedIds={tagIds} onChange={setTagIds} />
          </div>

          {!task.parentTaskId && (
            <div className="grid gap-2">
              <Label>Subtasks</Label>
              <SubtaskList parentTaskId={task.id} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTask.isPending}
            className="sm:mr-auto"
          >
            {deleteTask.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete
          </Button>
          <Button type="button" onClick={handleSave} disabled={updateTask.isPending || !title.trim()}>
            {updateTask.isPending && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
