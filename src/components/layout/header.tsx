"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { ProfileDropdown } from "@/components/profile-dropdown";

// Glass chrome per Prism: glass-bg fill + 12px backdrop blur + glass-border
// hairline once content scrolls underneath. No drop shadows.
export function Header(): React.ReactElement {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = (): void => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 bg-glass backdrop-blur-md",
        offset > 10
          ? "border-b border-glass-border"
          : "border-b border-transparent",
      )}
    >
      <div className="relative flex h-full items-center gap-3 p-4 sm:gap-4">
        <SidebarTrigger variant="outline" className="max-md:scale-125" />
        <Separator orientation="vertical" className="h-6 bg-line" />
        <Search className="me-auto" />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </div>
    </header>
  );
}
