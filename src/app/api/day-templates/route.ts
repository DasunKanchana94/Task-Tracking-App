import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, unauthorized } from "@/lib/api-errors";
import { snapshotDayBlocks } from "@/features/day-templates/lib/apply";
import { createDayTemplateSchema } from "@/features/day-templates/lib/schemas";
import { toDayTemplateDto } from "@/features/day-templates/lib/serialize";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const templates = await prisma.dayTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ items: templates.map(toDayTemplateDto) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createDayTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid template data", 400, parsed.error.flatten().fieldErrors);
  }

  const { name, date } = parsed.data;
  const blocks = await snapshotDayBlocks(prisma, session.user.id, new Date(date));

  if (blocks.length === 0) {
    return apiError("NO_BLOCKS", "That date has no time blocks to save as a template", 400);
  }

  const template = await prisma.dayTemplate.create({
    data: { userId: session.user.id, name, blocks },
  });

  return NextResponse.json({ template: toDayTemplateDto(template) }, { status: 201 });
}
