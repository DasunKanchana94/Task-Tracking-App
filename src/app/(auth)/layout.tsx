import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="text-2xl font-semibold tracking-tight">Flowline</span>
          <p className="text-muted-foreground text-sm">
            Your day, planned with clarity.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
