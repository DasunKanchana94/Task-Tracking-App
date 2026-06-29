import type { Metadata } from "next";
import { format } from "date-fns";

import { auth } from "@/lib/auth";
import { TodayBoard } from "@/features/time-blocks/components/today-board";

export const metadata: Metadata = {
  title: "Today",
};

export default async function TodayPage() {
  const session = await auth();
  const today = new Date();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""} 👋
        </h1>
        <p className="text-muted-foreground text-sm">{format(today, "EEEE, MMMM d")}</p>
      </div>

      <TodayBoard date={today} />
    </div>
  );
}
