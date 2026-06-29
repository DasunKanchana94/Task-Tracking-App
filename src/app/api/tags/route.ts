import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, unauthorized } from "@/lib/api-errors";
import { createTagSchema } from "@/features/tags/lib/schemas";
import { toTagDto } from "@/features/tags/lib/serialize";

export async function GET() {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ items: tags.map(toTagDto) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = createTagSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid tag data", 400, parsed.error.flatten().fieldErrors);
  }

  const existing = await prisma.tag.findUnique({
    where: { userId_name: { userId: session.user.id, name: parsed.data.name } },
  });
  if (existing) return apiError("TAG_EXISTS", "A tag with this name already exists", 409);

  const tag = await prisma.tag.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json({ tag: toTagDto(tag) }, { status: 201 });
}
