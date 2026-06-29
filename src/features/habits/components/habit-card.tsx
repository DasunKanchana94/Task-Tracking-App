"use client";

import { useState } from "react";
import { Flame, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitHeatmap } from "@/features/habits/components/habit-heatmap";
import { HabitDetailDialog } from "@/features/habits/components/habit-detail-dialog";
import type { HabitDto } from "@/features/habits/lib/serialize";
import { dateKey } from "@/features/habits/lib/streak";
import { useDeleteHabit, useToggleHabitCheckIn } from "@/features/habits/lib/use-habits";

export function HabitCard({ habit }: { habit: HabitDto }) {
  const toggleCheckIn = useToggleHabitCheckIn();
  const deleteHabit = useDeleteHabit();
  const [detailOpen, setDetailOpen] = useState(false);

  const today = dateKey(new Date());
  const checkedToday = habit.loggedDates.includes(today);

  return (
    <Card data-testid={`habit-card-${habit.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-left"
          onClick={() => setDetailOpen(true)}
        >
          {habit.emoji && <span aria-hidden>{habit.emoji}</span>}
          <CardTitle className="text-base">{habit.name}</CardTitle>
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Delete ${habit.name}`}
          onClick={() => deleteHabit.mutate(habit.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span
            className="flex items-center gap-1 text-sm font-medium"
            data-testid={`habit-streak-${habit.id}`}
          >
            <Flame className="size-4 text-orange-500" />
            {habit.currentStreak} day{habit.currentStreak === 1 ? "" : "s"}
          </span>
          <Button
            type="button"
            size="sm"
            variant={checkedToday ? "secondary" : "default"}
            data-testid={`habit-checkin-${habit.id}`}
            onClick={() =>
              toggleCheckIn.mutate({ id: habit.id, date: today, checked: !checkedToday })
            }
            disabled={toggleCheckIn.isPending}
          >
            {checkedToday ? "Done today" : "Check in"}
          </Button>
        </div>

        <HabitHeatmap
          loggedDates={habit.loggedDates}
          color={habit.color}
          onToggle={(date) =>
            toggleCheckIn.mutate({ id: habit.id, date, checked: !habit.loggedDates.includes(date) })
          }
        />
      </CardContent>

      <HabitDetailDialog habit={habit} open={detailOpen} onOpenChange={setDetailOpen} />
    </Card>
  );
}
