"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Command,
  Crown,
  LayoutDashboard,
  Layers,
  MessagesSquare,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    label: "Fulfillment",
    items: [
      { href: "/overview", label: "Overview", icon: LayoutDashboard },
      { href: "/chats", label: "Chats", icon: MessagesSquare },
      { href: "/escalations", label: "Escalations", icon: TriangleAlert },
      { href: "/health", label: "Health", icon: Activity },
    ],
  },
  {
    label: "Executive",
    items: [
      { href: "/ceo", label: "CEO Dashboard", icon: Crown },
      { href: "/ceo/cohorts", label: "Cohorts", icon: Layers },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/ceo") return pathname === "/ceo";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  return (
    <aside className="flex w-56 flex-col border-r bg-muted/20 px-3 py-5">
      <div className="flex items-center gap-2 px-3 pb-6">
        <Command className="h-5 w-5 text-primary" />
        <div>
          <span className="text-sm font-semibold tracking-tight">
            Imagine AI
          </span>
          <p className="text-xs text-muted-foreground">Dashboard</p>
        </div>
      </div>
      <nav className="flex flex-col gap-5">
        {SECTIONS.map((section) => (
          <div key={section.label} className="flex flex-col gap-1">
            <span className="px-3 pb-1 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground/70">
              {section.label}
            </span>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
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
          </div>
        ))}
      </nav>
    </aside>
  );
}
