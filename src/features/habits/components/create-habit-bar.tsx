"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateHabit } from "@/features/habits/lib/use-habits";

export function CreateHabitBar() {
  const createHabit = useCreateHabit();
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createHabit.mutate({ name: trimmed, frequency: "daily" }, { onSuccess: () => setName("") });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="New habit name..."
        aria-label="New habit name"
        disabled={createHabit.isPending}
      />
      <Button type="submit" disabled={createHabit.isPending || !name.trim()}>
        {createHabit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Add habit
      </Button>
    </form>
  );
}
