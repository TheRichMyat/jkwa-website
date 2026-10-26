import { cacheLife } from "next/cache";

/**
 * Reading the date is synchronous IO under cacheComponents, so it is captured
 * in a "use cache" scope: prerendered into the static shell and refreshed daily.
 */
export default async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}
