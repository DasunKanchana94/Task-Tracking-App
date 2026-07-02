"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

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
import type { TimeBlockDto } from "@/features/time-blocks/lib/serialize";
import { useDeleteTimeBlock, useUpdateTimeBlock } from "@/features/time-blocks/lib/use-time-blocks";

export function BlockEditDialog({
  block,
  open,
  onOpenChange,
}: {
  block: TimeBlockDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateBlock = useUpdateTimeBlock();
  const deleteBlock = useDeleteTimeBlock();
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (block) setTitle(block.title ?? "");
  }, [block]);

  if (!block) return null;

  function handleSave() {
    if (!block) return;
    updateBlock.mutate(
      { id: block.id, payload: { title: title.trim() || null, updatedAt: block.updatedAt } },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  function handleDelete() {
    if (!block) return;
    deleteBlock.mutate(block.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit block</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="block-title">Title</Label>
            <Input
              id="block-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled block"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteBlock.isPending}
            className="sm:mr-auto"
          >
            {deleteBlock.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete block
          </Button>
          <Button type="button" onClick={handleSave} disabled={updateBlock.isPending}>
            {updateBlock.isPending && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
