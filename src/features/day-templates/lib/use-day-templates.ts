"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { DayTemplateDto } from "@/features/day-templates/lib/serialize";
import { dayTemplatesApi, DayTemplatesApiError } from "@/features/day-templates/lib/api";

const dayTemplatesKey = ["day-templates"] as const;

export function useDayTemplates() {
  return useQuery({
    queryKey: dayTemplatesKey,
    queryFn: () => dayTemplatesApi.list(),
    select: (data) => data.items,
  });
}

export function useCreateDayTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; date: string }) => dayTemplatesApi.create(payload),
    onSuccess: ({ template }) => {
      queryClient.setQueryData<{ items: DayTemplateDto[] } | undefined>(dayTemplatesKey, (current) =>
        current ? { items: [...current.items, template] } : { items: [template] },
      );
      toast.success(`Saved "${template.name}" with ${template.blocks.length} block(s)`);
    },
    onError: (error) => {
      toast.error(error instanceof DayTemplatesApiError ? error.message : "Failed to save template");
    },
  });
}

export function useDeleteDayTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dayTemplatesApi.remove(id),
    onMutate: async (id: string) => {
      queryClient.setQueryData<{ items: DayTemplateDto[] } | undefined>(dayTemplatesKey, (current) =>
        current ? { items: current.items.filter((template) => template.id !== id) } : current,
      );
    },
    onError: (error) => {
      toast.error(error instanceof DayTemplatesApiError ? error.message : "Failed to delete template");
      queryClient.invalidateQueries({ queryKey: dayTemplatesKey });
    },
  });
}

export function useApplyDayTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => dayTemplatesApi.apply(id, date),
    onSuccess: (result) => {
      toast.success(
        `Applied: ${result.blocksCreated} block(s) and ${result.tasksCreated} task(s) created` +
          (result.skipped ? `, ${result.skipped} already existed` : ""),
      );
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "time-blocks" });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error(error instanceof DayTemplatesApiError ? error.message : "Failed to apply template");
    },
  });
}
