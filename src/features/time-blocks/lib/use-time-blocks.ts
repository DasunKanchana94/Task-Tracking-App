"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  TimeBlocksApiError,
  timeBlocksApi,
  type CreateTimeBlockPayload,
  type UpdateTimeBlockPayload,
} from "@/features/time-blocks/lib/api";
import type { TimeBlockDto } from "@/features/time-blocks/lib/serialize";

const timeBlocksKeyPrefix = "time-blocks" as const;

export function useTimeBlocks(range: { from: string; to: string }) {
  return useQuery({
    queryKey: [timeBlocksKeyPrefix, range.from, range.to],
    queryFn: () => timeBlocksApi.list(range),
    select: (data) => data.items,
  });
}

function patchAllTimeBlockQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (items: TimeBlockDto[]) => TimeBlockDto[],
) {
  queryClient.setQueriesData<{ items: TimeBlockDto[] } | undefined>(
    { predicate: (query) => query.queryKey[0] === timeBlocksKeyPrefix },
    (current) => (current ? { items: updater(current.items) } : current),
  );
}

export function useCreateTimeBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTimeBlockPayload) => timeBlocksApi.create(payload),
    onSuccess: ({ timeBlock }) => {
      patchAllTimeBlockQueries(queryClient, (items) => [...items, timeBlock]);
    },
    onError: (error) => {
      toast.error(error instanceof TimeBlocksApiError ? error.message : "Failed to create time block");
    },
  });
}

export function useUpdateTimeBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTimeBlockPayload }) =>
      timeBlocksApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      patchAllTimeBlockQueries(queryClient, (items) =>
        items.map((block) => (block.id === id ? { ...block, ...payload } as TimeBlockDto : block)),
      );
    },
    onSuccess: ({ timeBlock }) => {
      patchAllTimeBlockQueries(queryClient, (items) =>
        items.map((block) => (block.id === timeBlock.id ? timeBlock : block)),
      );
    },
    onError: (error) => {
      toast.error(error instanceof TimeBlocksApiError ? error.message : "Failed to update time block");
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === timeBlocksKeyPrefix });
    },
  });
}

export function useDeleteTimeBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeBlocksApi.remove(id),
    onMutate: async (id: string) => {
      patchAllTimeBlockQueries(queryClient, (items) => items.filter((block) => block.id !== id));
    },
    onError: (error) => {
      toast.error(error instanceof TimeBlocksApiError ? error.message : "Failed to delete time block");
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === timeBlocksKeyPrefix });
    },
  });
}
