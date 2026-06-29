"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateTag, useDeleteTag, useTags } from "@/features/tags/lib/use-tags";

const DEFAULT_COLOR = "#4f46e5";

export function TagManager() {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createTag.mutate({ name: trimmed, color }, { onSuccess: () => setName("") });
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-9 w-10 cursor-pointer rounded-md border"
          aria-label="Tag color"
        />
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New tag name..."
          aria-label="New tag name"
          disabled={createTag.isPending}
        />
        <Button type="submit" disabled={createTag.isPending || !name.trim()}>
          {createTag.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add
        </Button>
      </form>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && tags && tags.length === 0 && (
        <p className="text-muted-foreground text-sm">No tags yet. Create one above.</p>
      )}

      {!isLoading && tags && tags.length > 0 && (
        <ul className="flex flex-col gap-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: tag.color ?? "#94a3b8" }}
                  aria-hidden
                />
                {tag.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete ${tag.name}`}
                onClick={() => deleteTag.mutate(tag.id)}
                disabled={deleteTag.isPending}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
