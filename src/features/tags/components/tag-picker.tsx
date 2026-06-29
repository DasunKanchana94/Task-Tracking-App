"use client";

import { useState } from "react";
import { TagIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTags } from "@/features/tags/lib/use-tags";

export function TagPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const { data: tags } = useTags();
  const [open, setOpen] = useState(false);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((tagId) => tagId !== id) : [...selectedIds, id]);
  }

  const selectedTags = (tags ?? []).filter((tag) => selectedIds.includes(tag.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="flex flex-wrap gap-1">
          <TagIcon className="size-3.5" />
          {selectedTags.length === 0 ? (
            "Add tags"
          ) : (
            selectedTags.map((tag) => (
              <Badge key={tag.id} variant="secondary" style={{ borderColor: tag.color ?? undefined }}>
                {tag.name}
              </Badge>
            ))
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        {!tags || tags.length === 0 ? (
          <p className="text-muted-foreground text-sm">No tags yet. Create some on the Tags page.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tags.map((tag) => (
              <li key={tag.id} className="flex items-center gap-2">
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={selectedIds.includes(tag.id)}
                  onCheckedChange={() => toggle(tag.id)}
                />
                <label htmlFor={`tag-${tag.id}`} className="flex items-center gap-2 text-sm">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: tag.color ?? "#94a3b8" }}
                    aria-hidden
                  />
                  {tag.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
