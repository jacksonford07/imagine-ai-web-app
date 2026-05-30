import {
  Activity,
  Crown,
  Layers,
  LayoutDashboard,
  MessagesSquare,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
}

export interface NavGroupData {
  title: string;
  items: NavItem[];
}

export interface SidebarData {
  user: { name: string; email: string; avatar?: string };
  navGroups: NavGroupData[];
}

export const sidebarData: SidebarData = {
  user: { name: "Imagine AI", email: "ops@imagine.education" },
  navGroups: [
    {
      title: "Fulfillment",
      items: [
        { title: "Overview", url: "/overview", icon: LayoutDashboard },
        { title: "Chats", url: "/chats", icon: MessagesSquare },
        { title: "Escalations", url: "/escalations", icon: TriangleAlert },
        { title: "Health", url: "/health", icon: Activity },
      ],
    },
    {
      title: "Executive",
      items: [
        { title: "CEO Dashboard", url: "/ceo", icon: Crown },
        { title: "Cohorts", url: "/ceo/cohorts", icon: Layers },
      ],
    },
  ],
};
