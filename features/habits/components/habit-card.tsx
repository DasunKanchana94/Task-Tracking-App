"use client";

import { useState } from "react";
import { Flame, GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { HabitHeatmap } from "@/features/habits/components/habit-heatmap";
import { HabitDetailDialog } from "@/features/habits/components/habit-detail-dialog";
import type { HabitDto } from "@/features/habits/lib/serialize";
import { dateKey } from "@/features/habits/lib/streak";
import { useDeleteHabit, useToggleHabitCheckIn } from "@/features/habits/lib/use-habits";

export function HabitCard({ habit }: { habit: HabitDto }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  });
  const toggleCheckIn = useToggleHabitCheckIn();
  const deleteHabit = useDeleteHabit();
  const [detailOpen, setDetailOpen] = useState(false);
  const [heatmapOpen, setHeatmapOpen] = useState(false);

  const today = dateKey(new Date());
  const checkedToday = habit.loggedDates.includes(today);

  return (
    <div
      ref={setNodeRef}
      data-testid={`habit-card-${habit.id}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex flex-col rounded-md border bg-card"
    >
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          aria-label="Drag to reorder"
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-left"
          onClick={() => setDetailOpen(true)}
        >
          {habit.emoji && <span aria-hidden>{habit.emoji}</span>}
          <span className="font-medium leading-none">{habit.name}</span>
        </button>

        <span
          className="flex items-center gap-1 text-sm font-medium text-orange-500"
          data-testid={`habit-streak-${habit.id}`}
        >
          <Flame className="size-3.5" />
          {habit.currentStreak}
        </span>

        <Button
          type="button"
          size="sm"
          variant={checkedToday ? "secondary" : "default"}
          className="h-7 px-2 text-xs"
          data-testid={`habit-checkin-${habit.id}`}
          onClick={() =>
            toggleCheckIn.mutate({ id: habit.id, date: today, checked: !checkedToday })
          }
          disabled={toggleCheckIn.isPending}
        >
          {checkedToday ? "✓ Done" : "Check in"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label={`Delete ${habit.name}`}
          onClick={() => deleteHabit.mutate(habit.id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Collapsible heatmap */}
      <button
        type="button"
        className="border-t px-3 py-1 text-left"
        onClick={() => setHeatmapOpen((o) => !o)}
      >
        <span className="text-muted-foreground text-xs">{heatmapOpen ? "Hide heatmap ▲" : "Show heatmap ▼"}</span>
      </button>
      {heatmapOpen && (
        <div className="overflow-x-auto px-3 pb-2">
          <HabitHeatmap
            loggedDates={habit.loggedDates}
            color={habit.color}
            onToggle={(date) =>
              toggleCheckIn.mutate({ id: habit.id, date, checked: !habit.loggedDates.includes(date) })
            }
          />
        </div>
      )}

      <HabitDetailDialog habit={habit} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
