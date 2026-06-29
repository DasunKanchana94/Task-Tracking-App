import type { Tag } from "@prisma/client";

export type TagDto = Omit<Tag, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export function toTagDto(tag: Tag): TagDto {
  return {
    ...tag,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}
