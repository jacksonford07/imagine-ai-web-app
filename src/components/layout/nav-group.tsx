"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavGroupData } from "./sidebar-data";

function isActive(pathname: string, url: string): boolean {
  if (url === "/ceo") return pathname === "/ceo";
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavGroup({ title, items }: NavGroupData): React.ReactElement {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive(pathname, item.url)}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  {Icon !== undefined && <Icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
