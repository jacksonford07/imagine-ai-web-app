import { Sidebar } from "@/components/nav/sidebar";
import { Header } from "@/components/nav/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-8 py-7">{children}</main>
      </div>
    </div>
  );
}
