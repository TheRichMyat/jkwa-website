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

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: lanAddresses,
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
