"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { TaskDto } from "@/features/tasks/lib/serialize";
import {
  ApiError,
  tasksApi,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "@/features/tasks/lib/api";

const tasksKey = ["tasks"] as const;

export function useTasks() {
  return useQuery({
    queryKey: tasksKey,
    queryFn: () => tasksApi.list({ includeSubtasks: true }),
    select: (data) => data.items.filter((task) => !task.parentTaskId),
  });
}

export function useSubtasks(parentTaskId: string) {
  return useQuery({
    queryKey: tasksKey,
    queryFn: () => tasksApi.list({ includeSubtasks: true }),
    select: (data) => data.items.filter((task) => task.parentTaskId === parentTaskId),
  });
}

function recomputeSubtaskCount(queryClient: ReturnType<typeof useQueryClient>, parentTaskId: string | null) {
  if (!parentTaskId) return;
  queryClient.setQueryData<{ items: TaskDto[] } | undefined>(tasksKey, (current) => {
    if (!current) return current;
    const subtasks = current.items.filter((task) => task.parentTaskId === parentTaskId);
    const subtaskCount = { total: subtasks.length, completed: subtasks.filter((t) => t.status === "completed").length };
    return {
      items: current.items.map((task) => (task.id === parentTaskId ? { ...task, subtaskCount } : task)),
    };
  });
}

function patchTaskInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  patch: Partial<TaskDto>,
) {
  queryClient.setQueryData<{ items: TaskDto[] } | undefined>(tasksKey, (current) => {
    if (!current) return current;
    return {
      items: current.items.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    };
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.create(payload),
    onSuccess: ({ task }) => {
      queryClient.setQueryData<{ items: TaskDto[] } | undefined>(tasksKey, (current) =>
        current ? { items: [...current.items, task] } : { items: [task] },
      );
      recomputeSubtaskCount(queryClient, task.parentTaskId);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to create task");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      tasksApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      patchTaskInCache(queryClient, id, payload as Partial<TaskDto>);
    },
    onSuccess: ({ task }) => {
      patchTaskInCache(queryClient, task.id, task);
      recomputeSubtaskCount(queryClient, task.parentTaskId);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update task");
      queryClient.invalidateQueries({ queryKey: tasksKey });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      completed ? tasksApi.complete(id) : tasksApi.uncomplete(id),
    onMutate: async ({ id, completed }) => {
      patchTaskInCache(queryClient, id, {
        status: completed ? "completed" : "pending",
        completedAt: completed ? new Date().toISOString() : null,
      } as Partial<TaskDto>);
    },
    onSuccess: ({ task }) => {
      patchTaskInCache(queryClient, task.id, task);
      recomputeSubtaskCount(queryClient, task.parentTaskId);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to update task");
      queryClient.invalidateQueries({ queryKey: tasksKey });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onMutate: async (id: string) => {
      let parentTaskId: string | null = null;
      queryClient.setQueryData<{ items: TaskDto[] } | undefined>(tasksKey, (current) => {
        if (!current) return current;
        parentTaskId = current.items.find((task) => task.id === id)?.parentTaskId ?? null;
        return { items: current.items.filter((task) => task.id !== id) };
      });
      recomputeSubtaskCount(queryClient, parentTaskId);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Failed to delete task");
      queryClient.invalidateQueries({ queryKey: tasksKey });
    },
  });
}
