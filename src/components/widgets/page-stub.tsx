import { Construction } from "lucide-react";
import { PageHeader } from "@/components/widgets/page-header";
import { Card } from "@/components/ui/card";

// Route stub so navigation never 404s while a page is still in flight.
// Page-build stories replace these with the real implementation.
export function PageStub({
  title,
  description,
}: {
  title: string;
  description: string;
}): React.ReactElement {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card className="flex items-start gap-3 border-line bg-glass p-5">
        <Construction className="mt-0.5 h-5 w-5 shrink-0 text-fg-muted" />
        <div className="text-sm">
          <p className="font-medium text-fg-primary">
            This page is being built
          </p>
          <p className="mt-1 text-fg-muted">
            The data pipeline and UI for this section land in an upcoming
            release. Navigation, access control, and the surrounding shell are
            already live.
          </p>
        </div>
      </Card>
    </div>
  );
}
