import { PageHeader } from "@/components/widgets/page-header";
import { Card } from "@/components/ui/card";

export default function EscalationsPage(): React.ReactElement {
  return (
    <div>
      <PageHeader
        title="Escalations"
        description="Triggered escalations with ack/resolve timings."
      />
      <Card className="p-8 text-center text-sm text-muted-foreground">
        Coming next: escalations table wired to /internal/admin/escalations.
      </Card>
    </div>
  );
}
