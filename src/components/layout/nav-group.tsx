"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavGroupData, NavItem } from "./sidebar-data";

export function NavGroup({ title, items }: NavGroupData): React.ReactElement {
  const { state, isMobile } = useSidebar();
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url ?? ""}`;
          if (item.items === undefined)
            return (
              <SidebarMenuLink key={key} item={item} pathname={pathname} />
            );
          if (state === "collapsed" && !isMobile)
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                pathname={pathname}
              />
            );
          return (
            <SidebarMenuCollapsible key={key} item={item} pathname={pathname} />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavBadge({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>;
}

function SidebarMenuLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
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
          href={item.url ?? "#"}
          onClick={() => {
            setOpenMobile(false);
          }}
        >
          {Icon !== undefined && <Icon />}
          <span>{item.title}</span>
          {item.badge !== undefined && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarMenuCollapsible({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}): React.ReactElement {
  const { setOpenMobile } = useSidebar();
  const Icon = item.icon;
  return (
    <Collapsible
      asChild
      defaultOpen={checkIsActive(pathname, item, true)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {Icon !== undefined && <Icon />}
            <span>{item.title}</span>
            {item.badge !== undefined && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => {
              const SubIcon = subItem.icon;
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={checkIsActive(pathname, subItem)}
                  >
                    <Link
                      href={subItem.url}
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      {SubIcon !== undefined && <SubIcon />}
                      <span>{subItem.title}</span>
                      {subItem.badge !== undefined && (
                        <NavBadge>{subItem.badge}</NavBadge>
                      )}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarMenuCollapsedDropdown({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}): React.ReactElement {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={checkIsActive(pathname, item)}
          >
            {Icon !== undefined && <Icon />}
            <span>{item.title}</span>
            {item.badge !== undefined && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge !== undefined ? `(${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items?.map((sub) => {
            const SubIcon = sub.icon;
            return (
              <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                <Link
                  href={sub.url}
                  className={checkIsActive(pathname, sub) ? "bg-secondary" : ""}
                >
                  {SubIcon !== undefined && <SubIcon />}
                  <span className="max-w-52 text-wrap">{sub.title}</span>
                  {sub.badge !== undefined && (
                    <span className="ms-auto text-xs">{sub.badge}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function checkIsActive(
  pathname: string,
  item: NavItem,
  mainNav = false,
): boolean {
  return (
    pathname === item.url ||
    (item.url === "/ceo" && pathname === "/ceo") ||
    (item.url !== undefined &&
      item.url !== "/ceo" &&
      pathname.startsWith(`${item.url}/`)) ||
    Boolean(item.items?.some((i) => i.url === pathname)) ||
    (mainNav &&
      pathname.split("/")[1] !== "" &&
      pathname.split("/")[1] === item.url?.split("/")[1])
  );
}
