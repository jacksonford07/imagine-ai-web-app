"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TopNavLink } from "./sidebar-data";

function isActive(pathname: string, href: string): boolean {
  if (href === "/ceo")
    return pathname === "/ceo" || pathname === "/ceo/cohorts";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNav({
  className,
  links,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  links: TopNavLink[];
}): React.ReactElement {
  const pathname = usePathname();
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className={cn("md:size-7 lg:hidden", className)}
          >
            <Menu />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start">
          {links.map(({ title, href }) => (
            <DropdownMenuItem key={`${title}-${href}`} asChild>
              <Link
                href={href}
                className={
                  !isActive(pathname, href) ? "text-muted-foreground" : ""
                }
              >
                {title}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <nav
        className={cn(
          "hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6",
          className,
        )}
        {...props}
      >
        {links.map(({ title, href }) => (
          <Link
            key={`${title}-${href}`}
            href={href}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive(pathname, href) ? "" : "text-muted-foreground"
            }`}
          >
            {title}
          </Link>
        ))}
      </nav>
    </>
  );
}
