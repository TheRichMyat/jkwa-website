import { createElement, type ReactNode } from "react";

// Admin text is always treated as plain text: React escapes it, and we never
// use dangerouslySetInnerHTML. Only plain http(s) URLs become links.
const URL_PATTERN = /(https?:\/\/[^\s<>"']+)/g;
// Punctuation that usually ends a sentence rather than belonging to the URL
const TRAILING = /[.,;:!?)\]]+$/;

function linkify(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index;
    let url = match[0];
    const trailing = url.match(TRAILING)?.[0] ?? "";
    url = url.slice(0, url.length - trailing.length);
    if (start > last) out.push(text.slice(last, start));
    out.push(
      createElement(
        "a",
        {
          key: `${keyPrefix}-${start}`,
          href: url,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "underline underline-offset-4 hover:text-gold-deep",
        },
        url,
      ),
    );
    last = start + url.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Splits plain text on blank lines into paragraphs, with URLs turned into safe links. */
export function toParagraphs(body: string): ReactNode[][] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => linkify(p, `p${i}`));
}
