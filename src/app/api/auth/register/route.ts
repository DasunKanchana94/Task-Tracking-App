import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/features/auth/lib/schemas";

const SALT_ROUNDS = 12;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid registration data",
          details: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      {
        error: {
          code: "EMAIL_TAKEN",
          message: "An account with this email already exists",
        },
      },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
