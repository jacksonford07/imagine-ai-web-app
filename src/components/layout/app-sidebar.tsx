"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useLayout } from "@/context/layout-provider";
import { useRole } from "@/context/role-provider";
import { NavGroup, type NavBadges } from "./nav-group";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import { sidebarData, filterNavGroups } from "./sidebar-data";

export function AppSidebar({
  badges,
}: {
  badges?: NavBadges;
}): React.ReactElement {
  const { collapsible, variant } = useLayout();
  const roleInfo = useRole();
  const groups = filterNavGroups(sidebarData.navGroups, roleInfo);
  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <NavGroup key={group.title} {...group} badges={badges} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
