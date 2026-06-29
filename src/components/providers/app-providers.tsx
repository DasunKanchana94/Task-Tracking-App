"use client";

import * as React from "react";
import { Toaster } from "sonner";

import { QueryProvider } from "@/components/providers/query-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <QueryProvider>
          {children}
          <Toaster richColors position="bottom-right" closeButton />
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
