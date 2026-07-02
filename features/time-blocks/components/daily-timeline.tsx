"use client";

import { useRef, useState } from "react";
import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { addMinutes, endOfDay, format, startOfDay } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";
import { NowLine } from "@/features/time-blocks/components/now-line";
import { TimelineBlockItem } from "@/features/time-blocks/components/timeline-block-item";
import { useCreateTimeBlock, useDeleteTimeBlock, useTimeBlocks, useUpdateTimeBlock } from "@/features/time-blocks/lib/use-time-blocks";
import type { TimeBlockDto } from "@/features/time-blocks/lib/serialize";
import type { TaskDto } from "@/features/tasks/lib/serialize";
import {
  HOUR_HEIGHT,
  MIN_BLOCK_MINUTES,
  clampMinutes,
  minutesToY,
  snapMinutes,
  yToMinutes,
} from "@/features/time-blocks/lib/time-grid";

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

export const TIMELINE_DROPPABLE_ID = "timeline-grid";

export function DailyTimeline({
  date,
  onOpenBlock,
}: {
  date: Date;
  onOpenBlock?: (block: TimeBlockDto) => void;
}) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const { data: blocks, isLoading, isError } = useTimeBlocks({
    from: dayStart.toISOString(),
    to: dayEnd.toISOString(),
  });
  const createTimeBlock = useCreateTimeBlock();
  const updateTimeBlock = useUpdateTimeBlock();
  const deleteTimeBlock = useDeleteTimeBlock();

  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const gridRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({ id: TIMELINE_DROPPABLE_ID });
  const [draft, setDraft] = useState<{ start: number; end: number } | null>(null);
  const draftRef = useRef<{ start: number; end: number } | null>(null);
  const draggingNewRef = useRef(false);

  function setDraftBoth(value: { start: number; end: number } | null) {
    draftRef.current = value;
    setDraft(value);
  }

  function handleGridPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rectTop = rect.top;
    const startMinutes = clampMinutes(snapMinutes(yToMinutes(event.clientY - rectTop)));
    draggingNewRef.current = false;

    function handleMove(moveEvent: PointerEvent) {
      const currentMinutes = clampMinutes(snapMinutes(yToMinutes(moveEvent.clientY - rectTop)));
      if (Math.abs(currentMinutes - startMinutes) < MIN_BLOCK_MINUTES) return;
      draggingNewRef.current = true;
      const start = Math.min(startMinutes, currentMinutes);
      const end = Math.max(startMinutes, currentMinutes);
      setDraftBoth({ start, end });
    }

    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);

      const final = draftRef.current;
      setDraftBoth(null);

      if (final && draggingNewRef.current) {
        createTimeBlock.mutate({
          startAt: addMinutes(dayStart, final.start).toISOString(),
          endAt: addMinutes(dayStart, final.end).toISOString(),
        });
      }
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  useDndMonitor({
    onDragEnd(event) {
      if (event.over?.id !== TIMELINE_DROPPABLE_ID) return;
      const task = event.active.data.current?.task as TaskDto | undefined;
      const rect = gridRef.current?.getBoundingClientRect();
      if (!task || !rect) return;

      const activator = event.activatorEvent as PointerEvent;
      const dropClientY = activator.clientY + event.delta.y;
      const startMinutes = clampMinutes(snapMinutes(yToMinutes(dropClientY - rect.top)));
      const duration = task.estimatedMinutes ?? 30;

      createTimeBlock.mutate({
        taskId: task.id,
        title: task.title,
        startAt: addMinutes(dayStart, startMinutes).toISOString(),
        endAt: addMinutes(dayStart, startMinutes + duration).toISOString(),
      });
    },
  });

  function handleBlockChange(block: TimeBlockDto, startMinutes: number, endMinutes: number) {
    updateTimeBlock.mutate({
      id: block.id,
      payload: {
        startAt: addMinutes(dayStart, startMinutes).toISOString(),
        endAt: addMinutes(dayStart, endMinutes).toISOString(),
        updatedAt: block.updatedAt,
      },
    });
  }

  if (isLoading) {
    return (
      <div className="grid gap-1 p-4">
        {HOURS.slice(0, 8).map((hour) => (
          <Skeleton key={hour} className="h-[60px] w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-destructive p-4 text-sm">Failed to load the timeline.</p>;
  }

  return (
    <div className="relative flex">
      <div className="flex flex-col text-right">
        {HOURS.map((hour) => (
          <div key={hour} className="text-muted-foreground pr-2 text-xs" style={{ height: HOUR_HEIGHT }}>
            {format(new Date(2000, 0, 1, hour), "h a")}
          </div>
        ))}
      </div>

      <div
        ref={(node) => {
          gridRef.current = node;
          setNodeRef(node);
        }}
        className="relative flex-1 border-l touch-none"
        data-droppable-day={dayStart.toISOString()}
        onPointerDown={handleGridPointerDown}
        style={isOver ? { backgroundColor: "var(--accent)" } : undefined}
      >
        {HOURS.map((hour) => (
          <div key={hour} className="pointer-events-none border-b" style={{ height: HOUR_HEIGHT }} />
        ))}

        {isToday && <NowLine />}

        {(blocks ?? []).map((block) => (
          <TimelineBlockItem
            key={block.id}
            block={block}
            dayStart={dayStart}
            onChange={handleBlockChange}
            onOpen={onOpenBlock}
            onDelete={(b) => deleteTimeBlock.mutate(b.id)}
          />
        ))}

        {draft && (
          <div
            className="pointer-events-none absolute right-1 left-1 rounded-md border-2 border-dashed border-primary bg-primary/10"
            style={{ top: minutesToY(draft.start), height: minutesToY(draft.end - draft.start) }}
          />
        )}
      </div>
    </div>
  );
}
