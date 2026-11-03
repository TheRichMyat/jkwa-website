"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Renders the public Header/Footer everywhere except the admin panel. The
 * draft preview keeps them, so it looks exactly like the live page.
 */
export default function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const inAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (inAdmin && !pathname.endsWith("/preview")) return null;
  return children;
}
