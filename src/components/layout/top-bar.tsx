"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function TopBar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 sm:px-6">
      <span className="font-semibold tracking-tight">Flowline</span>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/today" className="text-muted-foreground hover:text-foreground">
          Today
        </Link>
        <Link href="/calendar" className="text-muted-foreground hover:text-foreground">
          Calendar
        </Link>
        <Link href="/tasks" className="text-muted-foreground hover:text-foreground">
          Tasks
        </Link>
        <Link href="/habits" className="text-muted-foreground hover:text-foreground">
          Habits
        </Link>
        <Link href="/templates" className="text-muted-foreground hover:text-foreground">
          Templates
        </Link>
        <Link href="/tags" className="text-muted-foreground hover:text-foreground">
          Tags
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="hidden dark:block" />
          <Moon className="block dark:hidden" />
        </Button>
        {session?.user && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Log out"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut />
          </Button>
        )}
      </div>
    </header>
  );
}
