import type { Metadata } from "next";

// Every admin page: kept out of search engines (also disallowed in robots.ts)
export const metadata: Metadata = {
  title: { template: "%s | JK&WA Admin", default: "JK&WA Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
