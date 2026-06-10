import {
  Activity,
  ArrowLeftRight,
  Bell,
  Command,
  FileText,
  Inbox,
  LayoutDashboard,
  Layers,
  MessagesSquare,
  Percent,
  Plug,
  TriangleAlert,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isEditor } from "@/lib/auth/role";
import type { RoleInfo } from "@/lib/auth/role";

// "any": every signed-in role. "editor": admin or editor (viewers denied —
// matches the /settings/* middleware gate). "fulfillment": admin or the
// per-user fulfillment-access flag. "admin": admins only (US-026 user
// management).
export type NavAccess = "any" | "editor" | "fulfillment" | "admin";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  /** Section roots ("/ceo", "/fulfillment") match exactly, not by prefix. */
  exact?: boolean;
  /** Slot for a live count badge (e.g. review queue) injected by the shell. */
  badgeKey?: "reviewQueue";
}

export interface NavGroupData {
  title: string;
  access: NavAccess;
  items: NavItem[];
}

export interface Team {
  name: string;
  logo: LucideIcon;
  plan: string;
}

export interface SidebarData {
  user: { name: string; email: string; avatar?: string };
  teams: Team[];
  navGroups: NavGroupData[];
}

export const sidebarData: SidebarData = {
  user: { name: "Imagine AI", email: "ops@imagine.education" },
  teams: [{ name: "Imagine Education", logo: Command, plan: "CEO Dashboard" }],
  navGroups: [
    {
      title: "CEO",
      access: "any",
      items: [
        { title: "Overview", url: "/ceo", icon: LayoutDashboard, exact: true },
        { title: "Cohorts", url: "/ceo/cohorts", icon: Layers },
        {
          title: "Transactions",
          url: "/ceo/transactions",
          icon: ArrowLeftRight,
        },
        {
          title: "Review Queue",
          url: "/ceo/review-queue",
          icon: Inbox,
          badgeKey: "reviewQueue",
        },
        { title: "Reports", url: "/ceo/reports", icon: FileText },
      ],
    },
    {
      title: "Fulfillment",
      access: "fulfillment",
      items: [
        {
          title: "Overview",
          url: "/fulfillment",
          icon: LayoutDashboard,
          exact: true,
        },
        { title: "Chats", url: "/fulfillment/chats", icon: MessagesSquare },
        {
          title: "Escalations",
          url: "/fulfillment/escalations",
          icon: TriangleAlert,
        },
        { title: "Health", url: "/fulfillment/health", icon: Activity },
      ],
    },
    {
      title: "Settings",
      access: "editor",
      items: [
        { title: "Users & Roles", url: "/settings/users", icon: Users },
        { title: "Integrations", url: "/settings/integrations", icon: Plug },
        { title: "Alerts", url: "/settings/alerts", icon: Bell },
        { title: "Commission", url: "/settings/commission", icon: Percent },
      ],
    },
  ],
};

// /settings/users is admin-only within the editor-visible Settings group.
const ADMIN_ONLY_URLS = new Set(["/settings/users"]);

export function filterNavGroups(
  groups: NavGroupData[],
  { role, fulfillmentAccess }: RoleInfo,
): NavGroupData[] {
  const isAdmin = role === "admin";
  return groups
    .filter((group) => {
      if (group.access === "admin") return isAdmin;
      if (group.access === "editor") return isEditor(role);
      if (group.access === "fulfillment") return isAdmin || fulfillmentAccess;
      return true;
    })
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => isAdmin || !ADMIN_ONLY_URLS.has(item.url),
      ),
    }))
    .filter((group) => group.items.length > 0);
}
