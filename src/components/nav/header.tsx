"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/nav/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Imagine AI</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">
          {titleFor(pathname)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar>
              <AvatarFallback>IA</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Signed in</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                void signOut({ callbackUrl: "/signin" });
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
