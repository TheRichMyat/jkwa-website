import os from "node:os";
import path from "node:path";
import type { NextConfig } from "next";

// This computer's own LAN addresses, read at startup (they can change with
// DHCP). Lets a phone on the same Wi-Fi open http://<this-ip>:3000 during
// development; without it Next blocks its dev scripts and nothing is tappable.
// Dev server only — has no effect on production builds.
const lanAddresses = Object.values(os.networkInterfaces())
  .flat()
  .filter((net) => net && net.family === "IPv4" && !net.internal)
  .map((net) => net!.address);

// Editable images (hero slides, projects) come from Supabase storage. Allow only
// the public "media" bucket path on this project's host (read from the env, so
// a project change is just an env change). The Netlify adapter reads this too.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: lanAddresses,
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/media/**" }]
      : [],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Pin the root to web/ so a stray lockfile in a parent folder isn't picked up
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
