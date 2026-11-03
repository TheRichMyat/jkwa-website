"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

type Tone = "success" | "error";
interface Toast {
  id: number;
  tone: Tone;
  text: string;
}

interface ToastApi {
  success: (text: string) => void;
  error: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <Toaster>");
  return api;
}

/** Small "Saved" / "Couldn't save" messages, bottom right (bottom centre on phones) */
export default function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (tone: Tone, text: string) => {
      const id = nextId.current++;
      setToasts((all) => [...all.slice(-2), { id, tone, text }]);
      setTimeout(() => dismiss(id), tone === "error" ? 7000 : 3500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ success: (t) => push("success", t), error: (t) => push("error", t) }),
    [push],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-center gap-2 md:inset-x-auto md:right-6 md:bottom-6 md:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-sm border px-4 py-3 font-sans text-sm shadow-lg ${
              t.tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-line bg-ink text-white"
            }`}
          >
            {t.tone === "error" ? (
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            ) : (
              <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-light" />
            )}
            <span className="flex-1">{t.text}</span>
            <button type="button" aria-label="Close" onClick={() => dismiss(t.id)} className="-m-1 p-1 opacity-70 hover:opacity-100">
              <X aria-hidden className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
