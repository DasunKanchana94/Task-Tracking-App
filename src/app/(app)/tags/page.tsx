import { TagManager } from "@/features/tags/components/tag-manager";

export default function TagsPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Tags</h1>
      <TagManager />
    </main>
  );
}
