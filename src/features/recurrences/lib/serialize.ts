import type { Recurrence } from "@prisma/client";

export type RecurrenceDto = {
  id: string;
  rrule: string;
  startDate: string;
  endDate: string | null;
  endCount: number | null;
  timezone: string;
  taskTemplate: unknown;
  createdAt: string;
  updatedAt: string;
};

export function toRecurrenceDto(recurrence: Recurrence): RecurrenceDto {
  return {
    id: recurrence.id,
    rrule: recurrence.rrule,
    startDate: recurrence.startDate.toISOString().slice(0, 10),
    endDate: recurrence.endDate ? recurrence.endDate.toISOString().slice(0, 10) : null,
    endCount: recurrence.endCount,
    timezone: recurrence.timezone,
    taskTemplate: recurrence.taskTemplate,
    createdAt: recurrence.createdAt.toISOString(),
    updatedAt: recurrence.updatedAt.toISOString(),
  };
}
