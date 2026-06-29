import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, notFound, unauthorized } from "@/lib/api-errors";
import { updateTagSchema } from "@/features/tags/lib/schemas";
import { toTagDto } from "@/features/tags/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateTagSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid tag data", 400, parsed.error.flatten().fieldErrors);
  }

  const existing = await prisma.tag.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return notFound("Tag not found");

  if (parsed.data.name) {
    const nameTaken = await prisma.tag.findUnique({
      where: { userId_name: { userId: session.user.id, name: parsed.data.name } },
    });
    if (nameTaken && nameTaken.id !== id) {
      return apiError("TAG_EXISTS", "A tag with this name already exists", 409);
    }
  }

  const tag = await prisma.tag.update({ where: { id }, data: parsed.data });

  return NextResponse.json({ tag: toTagDto(tag) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const existing = await prisma.tag.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return notFound("Tag not found");

  await prisma.tag.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
