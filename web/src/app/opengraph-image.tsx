import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// Default share image for every page without its own (project pages use their cover)
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site tokens (globals.css)
const PAPER = "#faf8f7";
const INK = "#2b2925";
const GOLD = "#b28e5a";
const GOLD_DEEP = "#88673f";
const MUTED = "#726c63";

export default async function Image() {
  // new URL(…, import.meta.url) makes the bundler ship these files with the
  // route, so they're there when the server renders it on Netlify
  const [cormorant, jost, logo] = await Promise.all([
    readFile(new URL("../../assets/fonts/cormorant-garamond-latin-400-normal.woff", import.meta.url)),
    readFile(new URL("../../assets/fonts/jost-latin-400-normal.woff", import.meta.url)),
    readFile(new URL("../../public/brand/logo-mark-gold.png", import.meta.url)),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PAPER,
          position: "relative",
        }}
      >
        {/* Thin gold frame */}
        <div style={{ position: "absolute", top: 32, left: 32, right: 32, bottom: 32, border: `1px solid ${GOLD}`, display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
          <img src={logoSrc} width={150} height={137} alt="" />
          <div style={{ marginTop: 36, fontFamily: "Cormorant", fontSize: 92, color: INK, lineHeight: 1 }}>
            {SITE_NAME}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 34 }}>
            <div style={{ width: 56, height: 1, background: GOLD }} />
            <div
              style={{
                margin: "0 22px",
                fontFamily: "Jost",
                fontSize: 24,
                letterSpacing: 7,
                textTransform: "uppercase",
                color: GOLD_DEEP,
              }}
            >
              {SITE_TAGLINE}
            </div>
            <div style={{ width: 56, height: 1, background: GOLD }} />
          </div>
          <div style={{ marginTop: 26, fontFamily: "Jost", fontSize: 22, color: MUTED }}>Singapore</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: cormorant, weight: 400, style: "normal" },
        { name: "Jost", data: jost, weight: 400, style: "normal" },
      ],
    },
  );
}
