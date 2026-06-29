"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";

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
import { HabitHeatmap } from "@/features/habits/components/habit-heatmap";
import { habitFrequencyValues } from "@/features/habits/lib/schemas";
import type { HabitDto } from "@/features/habits/lib/serialize";
import { useToggleHabitCheckIn, useUpdateHabit } from "@/features/habits/lib/use-habits";

const FREQUENCY_LABELS: Record<(typeof habitFrequencyValues)[number], string> = {
  daily: "Every day",
  weekdays: "Weekdays only",
  weekly: "X times per week",
};

export function HabitDetailDialog({
  habit,
  open,
  onOpenChange,
}: {
  habit: HabitDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateHabit = useUpdateHabit();
  const toggleCheckIn = useToggleHabitCheckIn();

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<(typeof habitFrequencyValues)[number]>("daily");
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState("3");

  useEffect(() => {
    if (!habit) return;
    setName(habit.name);
    setFrequency(habit.frequency);
    setTargetDaysPerWeek(String(habit.targetDaysPerWeek ?? 3));
  }, [habit]);

  if (!habit) return null;

  function handleSave() {
    if (!habit) return;
    updateHabit.mutate(
      {
        id: habit.id,
        payload: {
          name: name.trim(),
          frequency,
          targetDaysPerWeek: frequency === "weekly" ? Number(targetDaysPerWeek) : null,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{habit.emoji ? `${habit.emoji} ` : ""}{habit.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex items-center justify-around gap-4 rounded-md border py-3 text-sm">
            <div className="flex flex-col items-center gap-1">
              <span className="text-muted-foreground">Current streak</span>
              <span className="text-lg font-semibold">{habit.currentStreak}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Trophy className="size-3.5" /> Longest
              </span>
              <span className="text-lg font-semibold">{habit.longestStreak}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>History</Label>
            <HabitHeatmap
              loggedDates={habit.loggedDates}
              color={habit.color}
              onToggle={(date) =>
                toggleCheckIn.mutate({
                  id: habit.id,
                  date,
                  checked: !habit.loggedDates.includes(date),
                })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input id="habit-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="habit-frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value as typeof frequency)}>
                <SelectTrigger id="habit-frequency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {habitFrequencyValues.map((value) => (
                    <SelectItem key={value} value={value}>
                      {FREQUENCY_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {frequency === "weekly" && (
              <div className="grid gap-2">
                <Label htmlFor="habit-target">Days / week</Label>
                <Input
                  id="habit-target"
                  type="number"
                  min={1}
                  max={7}
                  value={targetDaysPerWeek}
                  onChange={(event) => setTargetDaysPerWeek(event.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={updateHabit.isPending || !name.trim()}>
            {updateHabit.isPending && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
