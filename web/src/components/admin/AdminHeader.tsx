"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { signOut } from "@/app/admin/_actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/hero", label: "Hero Slides" },
  { href: "/admin/settings", label: "Settings" },
] as const;

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

export default function AdminHeader({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the phone menu after navigating
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const navLink = (item: (typeof NAV)[number], mobile = false) => {
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={
          mobile
            ? `flex min-h-12 items-center border-b border-line font-sans text-base ${active ? "text-gold-deep" : "text-ink"}`
            : `relative py-2 font-sans text-sm transition-colors hover:text-gold-deep after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-gold-deep ${
                active ? "text-gold-deep after:opacity-100" : "text-ink after:opacity-0"
              }`
        }
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-4 md:px-8">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/brand/logo-mark-gold.png" alt="" width={400} height={365} sizes="40px" className="h-9 w-auto" />
          <span className="font-sans text-[15px] font-medium tracking-wide text-ink">JK&amp;WA Admin</span>
        </Link>

        <nav aria-label="Admin" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => navLink(item))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 font-sans text-sm text-ink hover:text-gold-deep"
          >
            View site <ArrowUpRight aria-hidden className="size-4" />
          </a>
          <form action={signOut}>
            <button
              type="submit"
              title={`Signed in as ${email}`}
              className="inline-flex items-center gap-1.5 font-sans text-sm text-muted hover:text-ink"
            >
              <LogOut aria-hidden className="size-4" /> Sign out
            </button>
          </form>
        </div>

        <button
          type="button"
          className="-mr-2 flex size-11 items-center justify-center text-ink lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
        </button>
      </div>

      {open && (
        <div id="admin-menu" className="border-t border-line bg-paper px-4 pb-5 lg:hidden">
          <nav aria-label="Admin menu" className="flex flex-col">
            {NAV.map((item) => navLink(item, true))}
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="flex min-h-12 items-center gap-1 border-b border-line font-sans text-base text-ink"
            >
              View site <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </nav>
          <p className="mt-4 truncate font-sans text-[13px] text-muted">Signed in as {email}</p>
          <form action={signOut} className="mt-2">
            <button type="submit" className="inline-flex min-h-11 items-center gap-1.5 font-sans text-base text-ink">
              <LogOut aria-hidden className="size-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
