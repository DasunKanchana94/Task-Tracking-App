import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, notFound, unauthorized } from "@/lib/api-errors";
import { applyDayTemplate, type TemplateBlock } from "@/features/day-templates/lib/apply";
import { applyDayTemplateSchema } from "@/features/day-templates/lib/schemas";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const template = await prisma.dayTemplate.findFirst({ where: { id, userId: session.user.id } });
  if (!template) return notFound("Template not found");

  const body = await request.json().catch(() => null);
  const parsed = applyDayTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid apply request", 400, parsed.error.flatten().fieldErrors);
  }

  const result = await applyDayTemplate(
    prisma,
    session.user.id,
    template.blocks as TemplateBlock[],
    new Date(parsed.data.date),
  );

  return NextResponse.json(result, { status: 201 });
}
