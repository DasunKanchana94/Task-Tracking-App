import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, unauthorized } from "@/lib/api-errors";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return unauthorized();
  const { id } = await params;

  const existing = await prisma.dayTemplate.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return notFound("Template not found");

  await prisma.dayTemplate.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
