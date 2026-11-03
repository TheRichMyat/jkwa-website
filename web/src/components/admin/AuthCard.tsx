import Image from "next/image";
import type { ReactNode } from "react";

/** The centred card used by the login, reset and "no access" screens */
export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone px-4 py-12">
      <div className="w-full max-w-[420px] rounded-sm border border-line bg-paper px-6 py-9 shadow-[0_12px_40px_-24px_rgba(43,41,37,0.35)] sm:px-9">
        <div className="flex flex-col items-center text-center">
          <Image src="/brand/logo-mark-gold.png" alt="" width={400} height={365} sizes="56px" className="h-12 w-auto" />
          <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.28em] text-muted">JK&amp;WA Admin</p>
          <h1 className="mt-2 font-display text-[2rem] font-normal leading-tight text-ink">{title}</h1>
        </div>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
