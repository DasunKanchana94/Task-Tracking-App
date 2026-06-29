import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to continue planning your day.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-foreground underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
