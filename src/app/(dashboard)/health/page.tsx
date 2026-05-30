import { PageHeader } from "@/components/widgets/page-header";
import { Card } from "@/components/ui/card";

export default function HealthPage(): React.ReactElement {
  return (
    <div>
      <PageHeader
        title="Health"
        description="Queue, webhook, follow-up and theme health."
      />
      <Card className="p-8 text-center text-sm text-muted-foreground">
        Coming next: health panels wired to /internal/admin/health.
      </Card>
    </div>
  );
}
