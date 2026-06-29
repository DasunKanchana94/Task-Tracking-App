import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #4f46e5")
    .nullish(),
  emoji: z.string().max(8).nullish(),
});

export const updateTagSchema = createTagSchema.partial();

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
