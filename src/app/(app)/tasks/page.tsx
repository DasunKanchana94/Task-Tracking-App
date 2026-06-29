import { TaskList } from "@/features/tasks/components/task-list";

export default function TasksPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <TaskList />
    </main>
  );
}
