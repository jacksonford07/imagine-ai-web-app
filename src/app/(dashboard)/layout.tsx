import { auth } from "@/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { CommandMenu } from "@/components/command-menu";
import { SearchProvider } from "@/context/search-provider";
import { LayoutProvider } from "@/context/layout-provider";
import { RoleProvider } from "@/context/role-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { resolveRoleInfo } from "@/lib/auth/role";
import { getReviewQueueCount } from "@/lib/sources/bot/ceo";
import type { NavBadges } from "@/components/layout/nav-group";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const [session, reviewQueue] = await Promise.all([
    auth(),
    getReviewQueueCount(),
  ]);
  const roleInfo = resolveRoleInfo(session?.user);
  const badges: NavBadges =
    reviewQueue.data !== null ? { reviewQueue: reviewQueue.data.count } : {};

  return (
    <RoleProvider value={roleInfo}>
      <SearchProvider>
        <LayoutProvider>
          <SidebarProvider>
            <AppSidebar badges={badges} />
            <SidebarInset>
              <Header />
              <main className="flex-1 overflow-y-auto px-6 py-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          <CommandMenu />
        </LayoutProvider>
      </SearchProvider>
    </RoleProvider>
  );
}
