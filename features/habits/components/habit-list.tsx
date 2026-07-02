"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Skeleton } from "@/components/ui/skeleton";
import { CreateHabitBar } from "@/features/habits/components/create-habit-bar";
import { HabitCard } from "@/features/habits/components/habit-card";
import { useHabits } from "@/features/habits/lib/use-habits";

const STORAGE_KEY = "flowline-habits-order";

function loadOrder(): string[] {
  try {
    return JSON.parse(typeof window !== "undefined" ? (localStorage.getItem(STORAGE_KEY) ?? "[]") : "[]");
  } catch {
    return [];
  }
}

function saveOrder(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function HabitList() {
  const { data: habits, isLoading } = useHabits();
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    setOrder(loadOrder());
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const activeHabits = habits?.filter((h) => !h.archivedAt) ?? [];

  const sorted =
    order.length > 0
      ? [...activeHabits].sort((a, b) => {
          const ai = order.indexOf(a.id);
          const bi = order.indexOf(b.id);
          if (ai === -1 && bi === -1) return 0;
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        })
      : activeHabits;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((h) => h.id === active.id);
    const newIndex = sorted.findIndex((h) => h.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex);
    const newOrder = reordered.map((h) => h.id);
    setOrder(newOrder);
    saveOrder(newOrder);
  }

  return (
    <div className="flex flex-col gap-4">
      <CreateHabitBar />

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!isLoading && activeHabits.length === 0 && (
        <p className="text-muted-foreground text-sm">No habits yet. Add one above to start tracking.</p>
      )}

      {!isLoading && sorted.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map((h) => h.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {sorted.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
