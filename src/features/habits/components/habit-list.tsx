"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { CreateHabitBar } from "@/features/habits/components/create-habit-bar";
import { HabitCard } from "@/features/habits/components/habit-card";
import { useHabits } from "@/features/habits/lib/use-habits";

export function HabitList() {
  const { data: habits, isLoading } = useHabits();

  return (
    <div className="flex flex-col gap-6">
      <CreateHabitBar />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {!isLoading && habits && habits.length === 0 && (
        <p className="text-muted-foreground text-sm">No habits yet. Add one above to start tracking.</p>
      )}

      {!isLoading && habits && habits.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {habits
            .filter((habit) => !habit.archivedAt)
            .map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
        </div>
      )}
    </div>
  );
}
