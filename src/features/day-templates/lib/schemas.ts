import { z } from "zod";

export const createDayTemplateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  date: z.string().date(),
});

export const applyDayTemplateSchema = z.object({
  date: z.string().date(),
});

export type CreateDayTemplateInput = z.infer<typeof createDayTemplateSchema>;
export type ApplyDayTemplateInput = z.infer<typeof applyDayTemplateSchema>;
