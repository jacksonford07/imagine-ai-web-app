import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/widgets/page-header";

// Render-side guard for /settings/users (US-026). The middleware already
// redirects non-admins; this covers a stale client navigation or a role
// change mid-session.
export function AccessDenied(): React.ReactElement {
  return (
    <div>
      <PageHeader title="Users & Roles" />
      <Card className="flex items-start gap-3 border-glass-border bg-glass p-5">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="text-sm">
          <p className="font-medium text-fg-primary">Access denied</p>
          <p className="mt-1 text-fg-muted">
            User management requires the Admin role. Ask an admin to upgrade
            your access from this page.
          </p>
        </div>
      </Card>
    </div>
  );
}
