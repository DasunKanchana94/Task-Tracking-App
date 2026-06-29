import type { ReactNode } from "react";

import { TopBar } from "@/components/layout/top-bar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
