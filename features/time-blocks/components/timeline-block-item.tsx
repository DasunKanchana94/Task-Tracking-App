"use client";

import { useRef, useState } from "react";
import { differenceInMinutes, format, parseISO } from "date-fns";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TimeBlockDto } from "@/features/time-blocks/lib/serialize";
import {
  MIN_BLOCK_MINUTES,
  clampMinutes,
  minutesToY,
  snapMinutes,
  yToMinutes,
} from "@/features/time-blocks/lib/time-grid";

type DragMode = "move" | "resize";

export function TimelineBlockItem({
  block,
  dayStart,
  onChange,
  onOpen,
  onDelete,
}: {
  block: TimeBlockDto;
  dayStart: Date;
  onChange: (block: TimeBlockDto, startMinutes: number, endMinutes: number) => void;
  onOpen?: (block: TimeBlockDto) => void;
  onDelete?: (block: TimeBlockDto) => void;
}) {
  const start = parseISO(block.startAt);
  const end = parseISO(block.endAt);
  const baseStartMinutes = differenceInMinutes(start, dayStart);
  const baseEndMinutes = differenceInMinutes(end, dayStart);
  const baseDuration = baseEndMinutes - baseStartMinutes;

  const [preview, setPreview] = useState<{ start: number; end: number } | null>(null);
  const previewRef = useRef<{ start: number; end: number } | null>(null);
  const draggingRef = useRef(false);

  const startMinutes = preview?.start ?? baseStartMinutes;
  const endMinutes = preview?.end ?? baseEndMinutes;

  function setPreviewBoth(value: { start: number; end: number } | null) {
    previewRef.current = value;
    setPreview(value);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>, mode: DragMode) {
    event.stopPropagation();
    event.preventDefault();
    draggingRef.current = false;
    const pointerId = event.pointerId;
    const startClientY = event.clientY;

    function handleMove(moveEvent: PointerEvent) {
      const deltaY = moveEvent.clientY - startClientY;
      if (Math.abs(deltaY) < 2 && !draggingRef.current) return;
      draggingRef.current = true;
      const deltaMinutes = snapMinutes(yToMinutes(deltaY));

      if (mode === "move") {
        let newStart = clampMinutes(baseStartMinutes + deltaMinutes);
        let newEnd = newStart + baseDuration;
        if (newEnd > 24 * 60) {
          newEnd = 24 * 60;
          newStart = newEnd - baseDuration;
        }
        setPreviewBoth({ start: newStart, end: newEnd });
      } else {
        const newEnd = clampMinutes(Math.max(baseEndMinutes + deltaMinutes, baseStartMinutes + MIN_BLOCK_MINUTES));
        setPreviewBoth({ start: baseStartMinutes, end: newEnd });
      }
    }

    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);

      const final = previewRef.current;
      setPreviewBoth(null);

      if (final && (final.start !== baseStartMinutes || final.end !== baseEndMinutes)) {
        onChange(block, final.start, final.end);
      } else if (!draggingRef.current && onOpen) {
        onOpen(block);
      }
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    void pointerId;
  }

  const top = minutesToY(startMinutes);
  const height = Math.max(minutesToY(endMinutes - startMinutes), 20);

  return (
    <div
      className={cn(
        "group absolute right-1 left-1 cursor-grab overflow-hidden rounded-md border px-2 py-1 text-xs shadow-sm select-none",
        "bg-primary/10 border-primary/30",
        preview && "cursor-grabbing opacity-90 shadow-md",
      )}
      style={{
        top,
        height,
        backgroundColor: block.color ? `${block.color}22` : undefined,
        borderColor: block.color ?? undefined,
      }}
      onPointerDown={(event) => handlePointerDown(event, "move")}
      data-testid="timeline-block"
    >
      <p className="truncate font-medium">{block.title ?? block.task?.title ?? "Untitled block"}</p>
      <p className="text-muted-foreground truncate">
        {format(dayStart.getTime() + startMinutes * 60_000, "h:mm a")} –{" "}
        {format(dayStart.getTime() + endMinutes * 60_000, "h:mm a")}
      </p>

      {onDelete && (
        <button
          type="button"
          aria-label="Delete block"
          className="absolute top-1 right-1 rounded p-0.5 opacity-0 transition-opacity hover:bg-black/20 group-hover:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete(block); }}
        >
          <X className="size-3" />
        </button>
      )}

      <div
        className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100"
        onPointerDown={(event) => handlePointerDown(event, "resize")}
        aria-label="Resize block"
      />
    </div>
  );
}
