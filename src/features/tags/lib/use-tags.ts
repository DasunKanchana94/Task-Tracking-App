"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { tagsApi, TagsApiError, type TagPayload } from "@/features/tags/lib/api";

const tagsKey = ["tags"] as const;

export function useTags() {
  return useQuery({
    queryKey: tagsKey,
    queryFn: () => tagsApi.list(),
    select: (data) => data.items,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TagPayload) => tagsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tagsKey }),
    onError: (error) => {
      toast.error(error instanceof TagsApiError ? error.message : "Failed to create tag");
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TagPayload> }) =>
      tagsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKey });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error(error instanceof TagsApiError ? error.message : "Failed to update tag");
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKey });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast.error(error instanceof TagsApiError ? error.message : "Failed to delete tag");
    },
  });
}
