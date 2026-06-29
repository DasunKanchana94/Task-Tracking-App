import { NextResponse } from "next/server";

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status },
  );
}

export const unauthorized = () =>
  apiError("UNAUTHORIZED", "You must be signed in to do this", 401);

export const notFound = (message = "Resource not found") =>
  apiError("NOT_FOUND", message, 404);
