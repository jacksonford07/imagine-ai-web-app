import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalyticsChart } from "./analytics-chart";

export function Analytics(): React.ReactElement {
  return (
    <div className="grid gap-4 lg:grid-cols-7">
      <Card className="col-span-1 lg:col-span-4">
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>
            Performance metrics for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent className="ps-2">
          <AnalyticsChart />
        </CardContent>
      </Card>
      <div className="col-span-1 grid gap-4 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Monthly conversion trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Session</CardTitle>
            <CardDescription>Time spent on platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4m 32s</div>
            <p className="text-xs text-muted-foreground">
              +12s from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
