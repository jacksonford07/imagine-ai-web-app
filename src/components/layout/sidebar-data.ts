import {
  Activity,
  Command,
  Crown,
  Layers,
  LayoutDashboard,
  MessagesSquare,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  badge?: string;
  items?: { title: string; url: string; icon?: LucideIcon; badge?: string }[];
}

export interface NavGroupData {
  title: string;
  items: NavItem[];
}

export interface Team {
  name: string;
  logo: LucideIcon;
  plan: string;
}

export interface TopNavLink {
  title: string;
  href: string;
}

export interface SidebarData {
  user: { name: string; email: string; avatar?: string };
  teams: Team[];
  navGroups: NavGroupData[];
}

export const sidebarData: SidebarData = {
  user: { name: "Imagine AI", email: "ops@imagine.education" },
  teams: [{ name: "Imagine AI", logo: Command, plan: "Operations" }],
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

export const topNav: TopNavLink[] = [
  { title: "Overview", href: "/overview" },
  { title: "Chats", href: "/chats" },
  { title: "Escalations", href: "/escalations" },
  { title: "CEO", href: "/ceo" },
];
