import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imagine AI — Bot Dashboard",
  description: "Read-only observability for the imagine-ai-bot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
