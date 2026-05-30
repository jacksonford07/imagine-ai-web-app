import {
  Download,
  MessageSquare,
  TriangleAlert,
  UserMinus,
  Users,
} from "lucide-react";
import { getOverview } from "@/lib/sources/bot/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Analytics } from "@/components/dashboard/analytics";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
}): React.ReactElement {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export default async function OverviewPage(): Promise<React.ReactElement> {
  const { data } = await getOverview();
  const dash = (n: number | undefined): string =>
    n === undefined ? "—" : String(n);

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports" disabled>
              Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              Notifications
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Active students"
              value={dash(data?.activeStudents)}
              hint="messaged in last 7d"
              icon={Users}
            />
            <MetricCard
              title="Open escalations"
              value={dash(data?.openEscalations)}
              hint="needs attention"
              icon={TriangleAlert}
            />
            <MetricCard
              title="Messages (7d)"
              value={dash(data?.messages7d)}
              hint="across all channels"
              icon={MessageSquare}
            />
            <MetricCard
              title="Quiet students"
              value={dash(data?.quietStudents)}
              hint="silent 7d+"
              icon={UserMinus}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="ps-2">
                <OverviewChart />
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Latest student touchpoints.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
