"use client";

import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";

/** A plain textarea that grows with its content */
export default function AutoGrowTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [props.value]);

  return <textarea ref={ref} rows={6} {...props} className={`${props.className ?? ""} resize-none overflow-hidden`} />;
}
