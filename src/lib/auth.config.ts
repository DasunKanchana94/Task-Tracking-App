import { NextResponse } from "next/server";
import type { NextAuthConfig } from "next-auth";

// Edge-safe Auth.js configuration: no providers that pull in Node-only APIs
// (bcrypt, Prisma) so this can run in the Edge middleware runtime. The full
// configuration (with Credentials + Google providers and the Prisma
// adapter) lives in `auth.ts` and is used everywhere else.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isPublicPath = ["/login", "/register"].some((path) =>
        pathname.startsWith(path),
      );
      const isAuthenticated = Boolean(auth?.user);

      if (isAuthenticated && isPublicPath) {
        return NextResponse.redirect(new URL("/today", request.url));
      }

      return isPublicPath || isAuthenticated;
    },
  },
} satisfies NextAuthConfig;
