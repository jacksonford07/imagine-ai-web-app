"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import type { NavGroupData, NavItem } from "./sidebar-data";

export type NavBadges = Partial<Record<"reviewQueue", number>>;

export function NavGroup({
  title,
  items,
  badges,
}: NavGroupData & { badges?: NavBadges }): React.ReactElement {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.08em] text-fg-subtle">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuLink
            key={item.url}
            item={item}
            pathname={pathname}
            badge={
              item.badgeKey !== undefined ? badges?.[item.badgeKey] : undefined
            }
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function SidebarMenuLink({
  item,
  pathname,
  badge,
}: {
  item: NavItem;
  pathname: string;
  badge?: number;
}): React.ReactElement {
  const { setOpenMobile } = useSidebar();
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(pathname, item)}
        tooltip={item.title}
      >
        <Link
          href={item.url}
          onClick={() => {
            setOpenMobile(false);
          }}
        >
          {Icon !== undefined && <Icon />}
          <span>{item.title}</span>
          {badge !== undefined && badge > 0 && (
            <Badge className="ms-auto rounded-full bg-brand/20 px-1.5 py-0 text-xs text-brand-soft hover:bg-brand/20">
              {badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function checkIsActive(pathname: string, item: NavItem): boolean {
  if (item.exact === true) return pathname === item.url;
  return pathname === item.url || pathname.startsWith(`${item.url}/`);
}
