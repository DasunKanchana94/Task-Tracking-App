"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/features/tasks/lib/use-tasks";

export function CreateTaskBar() {
  const [title, setTitle] = useState("");
  const createTask = useCreateTask();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createTask.mutate({ title: trimmed }, { onSuccess: () => setTitle("") });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add a task..."
        aria-label="New task title"
        disabled={createTask.isPending}
      />
      <Button type="submit" disabled={createTask.isPending || !title.trim()}>
        {createTask.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Add
      </Button>
    </form>
  );
}
