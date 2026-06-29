import { HabitList } from "@/features/habits/components/habit-list";

export default function HabitsPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Habits</h1>
      <HabitList />
    </main>
  );
}
