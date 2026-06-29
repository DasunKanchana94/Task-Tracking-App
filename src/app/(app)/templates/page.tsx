import { DayTemplateManager } from "@/features/day-templates/components/day-template-manager";

export default function TemplatesPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Templates</h1>
      <DayTemplateManager />
    </main>
  );
}
