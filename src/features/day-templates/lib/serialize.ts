import type { DayTemplate } from "@prisma/client";

import type { TemplateBlock } from "@/features/day-templates/lib/apply";

export type DayTemplateDto = {
  id: string;
  name: string;
  blocks: TemplateBlock[];
  createdAt: string;
  updatedAt: string;
};

export function toDayTemplateDto(template: DayTemplate): DayTemplateDto {
  return {
    id: template.id,
    name: template.name,
    blocks: template.blocks as TemplateBlock[],
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  };
}
