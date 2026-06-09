import { Info } from "lucide-react";
import { auth } from "@/auth";
import { AccessDenied } from "@/components/settings-users/access-denied";
import { AddUserForm } from "@/components/settings-users/add-user-form";
import { UsersTable } from "@/components/settings-users/users-table";
import { Card } from "@/components/ui/card";
import { LastSynced } from "@/components/widgets/last-synced";
import { PageHeader } from "@/components/widgets/page-header";
import { RefreshNow } from "@/components/widgets/refresh-now";
import { resolveRoleInfo } from "@/lib/auth/role";
import { listDashboardUsers } from "@/lib/sources/bot/admin-users";

export const dynamic = "force-dynamic";

export default async function UsersSettingsPage(): Promise<React.ReactElement> {
  const session = await auth();
  const { role } = resolveRoleInfo(session?.user);
  if (role !== "admin") {
    return <AccessDenied />;
  }

  const { data, error, fetchedAt } = await listDashboardUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Roles"
        description="Who can sign in, what they can do, and whether they see Fulfillment."
        actions={
          <>
            <LastSynced at={data !== null ? fetchedAt : null} />
            <RefreshNow />
          </>
        }
      />

      <AddUserForm />

      {error !== null ? (
        <Card className="flex items-start gap-3 border-primary/20 bg-primary/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium text-fg-primary">Awaiting data wiring</p>
            <p className="mt-1 text-fg-muted">
              The user list populates once the bot ships /internal/admin/users.
              Adding a user above will work as soon as the endpoint is live. (
              {error})
            </p>
          </div>
        </Card>
      ) : (
        <UsersTable
          users={data ?? []}
          currentEmail={session?.user?.email ?? null}
        />
      )}
    </div>
  );
}
