import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Start planning your day with Flowline.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <RegisterForm />
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
