"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { HabitDto } from "@/features/habits/lib/serialize";
import {
  habitsApi,
  HabitsApiError,
  type CreateHabitPayload,
  type UpdateHabitPayload,
} from "@/features/habits/lib/api";

const habitsKey = ["habits"] as const;

export function useHabits() {
  return useQuery({
    queryKey: habitsKey,
    queryFn: () => habitsApi.list(),
    select: (data) => data.items,
  });
}

function replaceHabitInCache(queryClient: ReturnType<typeof useQueryClient>, habit: HabitDto) {
  queryClient.setQueryData<{ items: HabitDto[] } | undefined>(habitsKey, (current) => {
    if (!current) return current;
    return { items: current.items.map((item) => (item.id === habit.id ? habit : item)) };
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHabitPayload) => habitsApi.create(payload),
    onSuccess: ({ habit }) => {
      queryClient.setQueryData<{ items: HabitDto[] } | undefined>(habitsKey, (current) =>
        current ? { items: [...current.items, habit] } : { items: [habit] },
      );
    },
    onError: (error) => {
      toast.error(error instanceof HabitsApiError ? error.message : "Failed to create habit");
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHabitPayload }) =>
      habitsApi.update(id, payload),
    onSuccess: ({ habit }) => replaceHabitInCache(queryClient, habit),
    onError: (error) => {
      toast.error(error instanceof HabitsApiError ? error.message : "Failed to update habit");
      queryClient.invalidateQueries({ queryKey: habitsKey });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => habitsApi.remove(id),
    onMutate: async (id: string) => {
      queryClient.setQueryData<{ items: HabitDto[] } | undefined>(habitsKey, (current) =>
        current ? { items: current.items.filter((habit) => habit.id !== id) } : current,
      );
    },
    onError: (error) => {
      toast.error(error instanceof HabitsApiError ? error.message : "Failed to delete habit");
      queryClient.invalidateQueries({ queryKey: habitsKey });
    },
  });
}

export function useToggleHabitCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, checked }: { id: string; date: string; checked: boolean }) =>
      checked ? habitsApi.checkIn(id, date) : habitsApi.uncheckIn(id, date),
    onSuccess: ({ habit }) => replaceHabitInCache(queryClient, habit),
    onError: (error) => {
      toast.error(error instanceof HabitsApiError ? error.message : "Failed to update check-in");
      queryClient.invalidateQueries({ queryKey: habitsKey });
    },
  });
}
