// One-off, re-runnable seed for Supabase (Phase 6). Uses the SECRET key from
// .env.local, so run it only on your own machine:  npm run seed
//
// Idempotent: uploads are skipped when the file already exists, settings and the
// project are upserted, project images are replaced, hero slides are added only
// if missing. The data below is a snapshot of what the site showed before Phase 6
// (lib/data/placeholder.ts); after this, the admin panel is the source of truth.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
if (!URL || !SECRET) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY (run with: npm run seed)");
  process.exit(1);
}

const BUCKET = "media";
const supabase = createClient(URL, SECRET, { auth: { persistSession: false } });

const SETTINGS = {
  id: 1,
  company_name: "Atelier JK&WA Pte. Ltd.",
  uen: "202643450N",
  contact_person: "Mr Kenji",
  address_lines: ["7 Temasek Boulevard", "#12-07, Suntec Tower One", "Singapore 038987"],
  phone: "+65 8028 7801",
  fax: "+65 6917 8977",
  email: "wadesign@gmail.com",
  hours: "Mon – Fri 9:00 AM – 6:00 PM (SGT)",
  booklet_url: "#",
  questionnaire_url: "#",
  socials: {},
};

const HERO = [
  {
    file: "public/images/hero/hero-1.jpg",
    path: "hero/hero-1.jpg",
    alt: "Japanese-inspired living room with timber shelving, a paper lantern and garden views",
    width: 1600,
    height: 893,
  },
  {
    file: "public/images/hero/hero-2.jpg",
    path: "hero/hero-2.jpg",
    alt: "Evening living room lit by paper lanterns and shoji screens, beside a garden",
    width: 1600,
    height: 893,
  },
];

const ceylon = (n, alt) => ({
  file: `public/images/projects/ceylon-road/ceylon-road-0${n}.jpg`,
  path: `projects/ceylon-road/ceylon-road-0${n}.jpg`,
  alt,
  width: n <= 2 ? 1600 : 1792,
  height: n <= 2 ? 898 : 2400,
});

const CEYLON_ROAD = {
  project: {
    slug: "ceylon-road",
    title: "Ceylon Road",
    category: "residential", // assumed; the owner will confirm
    location: "Singapore",
    featured: true,
    published: true,
    sort_order: 1,
  },
  cover: ceylon(1, "Long corridor lined with full-height timber shelving, leading to a bright window"),
  // Same order as the site showed before (cover not repeated)
  gallery: [
    ceylon(2, "Narrow dining room with a long white table, white chairs and a city view"),
    ceylon(7, "Calm bedroom with a linen-covered bed, timber bedside tables and a pendant light"),
    ceylon(3, "Double-height living space with a timber staircase, a paper pendant lamp and a potted tree"),
    ceylon(4, "Floor-to-ceiling timber shelving with lattice screen panels and ceramics"),
    ceylon(5, "Timber-panelled wardrobe wall with a low upholstered bench"),
    ceylon(6, "Shoji-style window with a ceramic vase of branches, set into a timber wall"),
  ],
};

const fail = (what, error) => {
  console.error(`✗ ${what}: ${error.message}`);
  process.exit(1);
};

const stats = { uploaded: 0, skipped: 0, bytes: 0 };

/** Upload a local file to media/<path> unless an object already exists there. */
async function upload({ file, path: objectPath }) {
  const folder = path.posix.dirname(objectPath);
  const name = path.posix.basename(objectPath);
  const { data: existing, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(folder, { search: name });
  if (listError) fail(`list ${folder}`, listError);
  if (existing.some((o) => o.name === name)) {
    stats.skipped++;
    return;
  }
  const body = await readFile(file);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, body, { contentType: "image/jpeg", upsert: false });
  if (error) fail(`upload ${objectPath}`, error);
  stats.uploaded++;
  stats.bytes += body.length;
}

// 1. Settings (single row)
{
  const { error } = await supabase.from("settings").upsert(SETTINGS, { onConflict: "id" });
  if (error) fail("settings", error);
}

// 2. Hero slides
for (const [i, slide] of HERO.entries()) {
  await upload(slide);
  const { data, error } = await supabase.from("hero_slides").select("id").eq("image_path", slide.path);
  if (error) fail("hero_slides select", error);
  if (data.length === 0) {
    const { error: insertError } = await supabase.from("hero_slides").insert({
      image_path: slide.path,
      alt: slide.alt,
      width: slide.width,
      height: slide.height,
      sort_order: i + 1,
    });
    if (insertError) fail("hero_slides insert", insertError);
  }
}

// 3. Ceylon Road: images, project (upsert by slug), image rows (replaced)
for (const image of [CEYLON_ROAD.cover, ...CEYLON_ROAD.gallery]) await upload(image);

const { data: project, error: projectError } = await supabase
  .from("projects")
  .upsert(CEYLON_ROAD.project, { onConflict: "slug" })
  .select("id")
  .single();
if (projectError) fail("projects upsert", projectError);

{
  const { error } = await supabase.from("project_images").delete().eq("project_id", project.id);
  if (error) fail("project_images reset", error);
}
const imageRows = [
  { kind: "cover", ...CEYLON_ROAD.cover, sort_order: 0 },
  ...CEYLON_ROAD.gallery.map((img, i) => ({ kind: "gallery", ...img, sort_order: i + 1 })),
].map(({ kind, path: image_path, alt, width, height, sort_order }) => ({
  project_id: project.id,
  kind,
  image_path,
  alt,
  width,
  height,
  sort_order,
}));
{
  const { error } = await supabase.from("project_images").insert(imageRows);
  if (error) fail("project_images insert", error);
}

// 4. Summary
const count = async (table) => {
  const { count: n, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) fail(`count ${table}`, error);
  return n;
};
console.log("Seed complete:");
console.log(`  settings        ${await count("settings")} row`);
console.log(`  hero_slides     ${await count("hero_slides")} rows`);
console.log(`  projects        ${await count("projects")} row(s)`);
console.log(`  project_images  ${await count("project_images")} rows`);
console.log(
  `  storage         ${stats.uploaded} uploaded (${(stats.bytes / 1024 / 1024).toFixed(2)} MB), ${stats.skipped} already there`,
);
