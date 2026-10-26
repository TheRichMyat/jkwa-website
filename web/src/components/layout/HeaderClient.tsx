"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import BookletButton from "@/components/ui/BookletButton";
import Container from "@/components/ui/Container";
import QuestionnaireButton from "@/components/ui/QuestionnaireButton";
import { NAV_ITEMS, sectionHref, type NavId } from "./nav";

interface HeaderClientProps {
  bookletUrl: string;
  questionnaireUrl: string;
}

// Page sections observed for the active link; "designers" belongs to ABOUT
const SECTION_TO_NAV: Record<string, NavId> = {
  home: "home",
  about: "about",
  designers: "about",
  services: "services",
  portfolio: "portfolio",
  contact: "contact",
};

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

// From lg to xl the bar only sticks once the 88px masthead has scrolled away
const MASTHEAD_QUERY = "(min-width: 1024px) and (max-width: 1279.98px)";
const getScrolled = () =>
  window.scrollY > (window.matchMedia(MASTHEAD_QUERY).matches ? 88 : 10);
const getAtBottom = () =>
  window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
const getFalse = () => false;

export default function HeaderClient({ bookletUrl, questionnaireUrl }: HeaderClientProps) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  const scrolled = useSyncExternalStore(subscribeScroll, getScrolled, getFalse);
  const atBottom = useSyncExternalStore(subscribeScroll, getAtBottom, getFalse);
  const [observed, setObserved] = useState<NavId>("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  let active: NavId | null = null;
  if (pathname.startsWith("/projects")) active = "portfolio";
  else if (onHome) active = atBottom ? "contact" : observed;

  // Active section on the home page: the first section crossing a band just
  // below the header wins.
  useEffect(() => {
    if (!onHome) return;
    const sections = Object.keys(SECTION_TO_NAV)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = sections.find((s) => visible.has(s.id));
        if (first) setObserved(SECTION_TO_NAV[first.id]);
      },
      { rootMargin: "-90px 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [onHome]);

  // Drawer: scroll lock, Escape, focus trap, focus return, close at desktop width
  useEffect(() => {
    if (!menuOpen) {
      if (wasOpen.current) menuButtonRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = () => desktop.matches && setMenuOpen(false);

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  // `contents` lets the bar below stick to the page rather than to <header>.
  // From lg to xl the header is two rows: a centred masthead that scrolls away,
  // then the sticky nav bar. Below lg and from xl it is a single sticky row.
  return (
    <header className="contents">
      <div className="hidden border-b border-line bg-paper lg:block xl:hidden">
        <Link
          href="/"
          className="mx-auto flex h-[88px] w-fit items-center gap-3.5"
        >
          <Image
            src="/brand/logo-mark-gold.png"
            alt=""
            width={400}
            height={365}
            sizes="57px"
            className="h-[52px] w-auto shrink-0"
          />
          <span className="flex flex-col">
            <span className="whitespace-nowrap font-display text-[22px] leading-tight text-gold-deep">
              Atelier JK&amp;WA Pte. Ltd.
            </span>
            <span className="mt-1 whitespace-nowrap font-sans text-[9px] uppercase leading-none tracking-[0.3em] text-muted">
              Interior Design &amp; Consultancy
            </span>
          </span>
        </Link>
      </div>

      <div
        className={`sticky top-0 z-50 border-b border-line bg-paper transition-shadow duration-300 ${
          scrolled ? "shadow-[0_6px_24px_-12px_rgba(43,41,37,0.18)]" : ""
        }`}
      >
        <Container className="flex h-[63px] items-center justify-between gap-6 xl:h-[87px]">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 lg:hidden xl:flex xl:gap-3.5"
          >
            <Image
              src="/brand/logo-mark-gold.png"
              alt=""
              width={400}
              height={365}
              preload
              sizes="57px"
              className="h-10 w-auto shrink-0 xl:h-[52px]"
            />
            <span className="flex min-w-0 flex-col">
              <span className="whitespace-nowrap font-display text-[17px] leading-tight text-gold-deep xl:text-[22px]">
                Atelier JK&amp;WA Pte. Ltd.
              </span>
              <span className="mt-1 hidden whitespace-nowrap font-sans text-[9px] uppercase leading-none tracking-[0.3em] text-muted min-[400px]:block">
                Interior Design &amp; Consultancy
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden lg:block xl:ml-auto">
            <ul className="flex items-center gap-8 wide:gap-10">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={sectionHref(item.id, onHome)}
                    aria-current={active === item.id ? "location" : undefined}
                    onClick={() => onHome && setObserved(item.id)}
                    className={`relative block py-2 font-sans text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:text-gold-deep after:absolute after:inset-x-0 after:bottom-[2px] after:h-px after:bg-gold after:transition-opacity ${
                      active === item.id ? "after:opacity-100" : "after:opacity-0"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 lg:flex wide:ml-4">
            <BookletButton url={bookletUrl} size="sm" />
            <QuestionnaireButton url={questionnaireUrl} size="sm" />
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="-mr-2.5 flex size-11 shrink-0 flex-col focus-visible:outline-1 focus-visible:outline-gold items-center justify-center gap-[7px] lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span aria-hidden className="h-px w-6 bg-ink" />
            <span aria-hidden className="h-px w-6 bg-ink" />
          </button>
        </Container>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        inert={!menuOpen}
      >
        <div
          aria-hidden
          onClick={closeMenu}
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 motion-reduce:transition-none ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          id="mobile-menu"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute inset-y-0 right-0 flex h-dvh w-full max-w-sm flex-col bg-paper transition-transform duration-300 ease-out motion-reduce:transition-none ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-16 shrink-0 items-center justify-end border-b border-line px-5 xs:px-6">
            <button
              ref={closeButtonRef}
              type="button"
              className="-mr-2.5 flex size-11 items-center justify-center text-ink focus-visible:outline-1 focus-visible:outline-gold"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <X aria-hidden className="size-6 stroke-1" />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6 xs:px-6">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.id} className="border-b border-line">
                  <a
                    href={sectionHref(item.id, onHome)}
                    aria-current={active === item.id ? "location" : undefined}
                    onClick={() => {
                      if (onHome) setObserved(item.id);
                      closeMenu();
                    }}
                    className={`flex min-h-16 items-center font-display text-[28px] leading-none transition-colors hover:text-gold-deep ${
                      active === item.id ? "text-gold-deep" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 flex-col gap-3 border-t border-line px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] xs:px-6">
            <BookletButton url={bookletUrl} className="w-full" onClick={closeMenu} />
            <QuestionnaireButton url={questionnaireUrl} className="w-full" onClick={closeMenu} />
          </div>
        </div>
      </div>
    </header>
  );
}
