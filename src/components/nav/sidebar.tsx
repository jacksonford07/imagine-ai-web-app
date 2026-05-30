"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessagesSquare,
  TriangleAlert,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/chats", label: "Chats", icon: MessagesSquare },
  { href: "/escalations", label: "Escalations", icon: TriangleAlert },
  { href: "/health", label: "Health", icon: Activity },
] as const;

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  return (
    <aside className="flex w-56 flex-col border-r bg-muted/20 px-3 py-5">
      <div className="px-3 pb-6">
        <span className="text-sm font-semibold tracking-tight">Imagine AI</span>
        <p className="text-xs text-muted-foreground">Bot dashboard</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
