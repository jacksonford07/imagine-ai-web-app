"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/nav/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const TITLES: Record<string, string> = {
  "/overview": "Overview",
  "/chats": "Chats",
  "/escalations": "Escalations",
  "/health": "Health",
  "/ceo": "CEO Dashboard",
  "/ceo/cohorts": "Cohorts",
};

function titleFor(pathname: string): string {
  if (TITLES[pathname] !== undefined) return TITLES[pathname];
  const match = Object.keys(TITLES)
    .filter((p) => pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0];
  return match !== undefined ? TITLES[match] : "Dashboard";
}

export function Header(): React.ReactElement {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Imagine AI</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">
          {titleFor(pathname)}
        </span>
      </div>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
