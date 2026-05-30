"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { topNav } from "@/components/layout/sidebar-data";

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
        "sticky top-0 z-40 h-16 bg-background",
        offset > 10 ? "shadow-sm" : "shadow-none",
      )}
    >
      <div className="relative flex h-full items-center gap-3 p-4 sm:gap-4">
        <SidebarTrigger variant="outline" className="max-md:scale-125" />
        <Separator orientation="vertical" className="h-6" />
        <TopNav links={topNav} className="me-auto" />
        <Search />
        <ThemeSwitch />
        <ProfileDropdown />
      </div>
    </header>
  );
}
