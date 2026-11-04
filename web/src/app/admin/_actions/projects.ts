"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { asAdmin, check, row as one, UserError } from "@/lib/admin/action";
import { listAll, removeObjects } from "@/lib/admin/media";
import type { ActionResult } from "@/lib/admin/result";
import { SLUG_MAX, SLUG_PATTERN } from "@/lib/admin/slug";

// ---------------------------------------------------------------------------
// Validation (every field is checked here, whatever the browser sent)
// ---------------------------------------------------------------------------

const requiredText = (label: string, max = 120) =>
  z.string().trim().min(1, `Please enter the ${label}.`).max(max, `The ${label} is too long.`);

/** Optional text: "" → null */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "This is too long.")
    .transform((v) => v || null);

/** Optional whole number typed into a text box: "" → null */
const optionalInt = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/[,\s]/g, ""))
    .refine((v) => v === "" || (/^\d+$/.test(v) && +v >= min && +v <= max), message)
    .transform((v) => (v === "" ? null : Number(v)));

const slug = z
  .string()
  .trim()
  .min(1, "Please enter a page address.")
  .max(SLUG_MAX, "The page address is too long.")
  .regex(SLUG_PATTERN, "Use only lowercase letters, numbers and single hyphens (e.g. ceylon-road).");

const basics = z.object({
  title: requiredText("title"),
  category: z.enum(["residential", "commercial"], { error: "Please choose a category." }),
  location: requiredText("location"),
  slug,
});

const projectForm = basics.extend({
  propertyType: optionalText(120),
  sizeSqft: optionalInt(1, 1_000_000, "Enter the size as a whole number, e.g. 3200."),
  duration: optionalText(120),
  scope: optionalText(160),
  year: optionalInt(1950, 2100, "Enter a year between 1950 and 2100."),
  storyHeading: optionalText(160),
  storyBody: optionalText(10_000),
  published: z.boolean(),
  featured: z.boolean(),
  /** Description for each photo, by image id */
  alts: z.record(z.uuid(), z.string().trim().max(300)),
  /** Gallery image ids, in display order */
  galleryOrder: z.array(z.uuid()).max(200),
});

export type ProjectFormInput = z.input<typeof projectForm>;
export type BasicsInput = z.input<typeof basics>;

function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return new UserError("Please check the highlighted fields.", errors);
}

async function assertSlugFree(supabase: SupabaseClient, value: string, exceptId?: string) {
  let query = supabase.from("projects").select("id").eq("slug", value);
  if (exceptId) query = query.neq("id", exceptId);
  const { data } = check(await query.limit(1));
  if (data && data.length > 0) {
    throw new UserError("Please check the highlighted fields.", {
      slug: "Another project already uses this page address. Please choose a different one.",
    });
  }
}

const isUniqueViolation = (message: string) => /duplicate key|unique/i.test(message);

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Step one of a new project: the basics, saved as a hidden draft */
export async function createProject(input: BasicsInput): Promise<ActionResult<{ id: string }>> {
  return asAdmin("createProject", async (supabase) => {
    const parsed = basics.safeParse(input);
    if (!parsed.success) throw fieldErrors(parsed.error);
    await assertSlugFree(supabase, parsed.data.slug);

    // New projects go to the end of the list
    const { data: last } = check(
      await supabase.from("projects").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle(),
    );
    const created = one(
      await supabase
        .from("projects")
        .insert({ ...parsed.data, published: false, featured: false, sort_order: (last?.sort_order ?? 0) + 1 })
        .select("id")
        .single(),
    );
    // A draft is invisible to the public, so there is no page cache to update yet
    return { id: created.id as string };
  });
}

export async function saveProject(projectId: string, input: ProjectFormInput): Promise<ActionResult<{ slug: string }>> {
  return asAdmin("saveProject", async (supabase) => {
    const id = z.uuid().parse(projectId);
    const parsed = projectForm.safeParse(input);
    if (!parsed.success) throw fieldErrors(parsed.error);
    const { alts, galleryOrder, ...form } = parsed.data;

    const { data: current } = check(
      await supabase.from("projects").select("slug, project_images(id, kind)").eq("id", id).maybeSingle(),
    );
    if (!current) throw new UserError("This project no longer exists.");
    const images = (current.project_images ?? []) as { id: string; kind: string }[];
    const has = (kind: string) => images.some((img) => img.kind === kind);

    if (form.published && !has("cover")) {
      throw new UserError("Add a cover photo before making the project visible on the website.");
    }
    if (has("before") !== has("after")) {
      throw new UserError(
        "Before & After needs both photos. Add the missing one, or remove the one you added.",
      );
    }
    if (form.slug !== current.slug) await assertSlugFree(supabase, form.slug, id);

    const update = await supabase
      .from("projects")
      .update({
        title: form.title,
        category: form.category,
        location: form.location,
        slug: form.slug,
        property_type: form.propertyType,
        size_sqft: form.sizeSqft,
        duration: form.duration,
        scope: form.scope,
        year: form.year,
        story_heading: form.storyHeading,
        story_body: form.storyBody,
        published: form.published,
        featured: form.featured,
      })
      .eq("id", id);
    if (update.error && isUniqueViolation(update.error.message)) {
      throw new UserError("Please check the highlighted fields.", {
        slug: "Another project already uses this page address. Please choose a different one.",
      });
    }
    check(update);

    // Photo descriptions and gallery order. Only this project's photos are
    // touched, whatever ids the browser sent.
    const order = new Map(galleryOrder.map((imageId, i) => [imageId, i + 1]));
    const writes = images
      .map((img) => {
        const patch: { alt?: string; sort_order?: number } = {};
        if (img.id in alts) patch.alt = alts[img.id];
        if (img.kind === "gallery" && order.has(img.id)) patch.sort_order = order.get(img.id);
        return Object.keys(patch).length
          ? supabase.from("project_images").update(patch).eq("id", img.id)
          : null;
      })
      .filter((w) => w !== null);
    (await Promise.all(writes)).forEach(check);

    updateTag("projects");
    updateTag(`project:${current.slug}`);
    if (form.slug !== current.slug) updateTag(`project:${form.slug}`);
    return { slug: form.slug };
  });
}

/** Delete a project, its photos (rows cascade) and every file in its folder */
export async function deleteProject(projectId: string, typedTitle: string): Promise<ActionResult<undefined>> {
  return asAdmin("deleteProject", async (supabase) => {
    const id = z.uuid().parse(projectId);
    const { data: project } = check(
      await supabase.from("projects").select("slug, title, project_images(image_path)").eq("id", id).maybeSingle(),
    );
    if (!project) return undefined;
    if (typedTitle.trim() !== project.title.trim()) {
      throw new UserError("The title you typed doesn't match. The project was not deleted.");
    }

    // Files recorded in the database (older projects may live outside the
    // project's own folder) plus anything else left in projects/<id>/
    const recorded = ((project.project_images ?? []) as { image_path: string }[]).map((img) => img.image_path);
    const inFolder = (await listAll(supabase, `projects/${id}`)).map((f) => f.path);

    check(await supabase.from("projects").delete().eq("id", id));
    await removeObjects(supabase, [...recorded, ...inFolder]);

    updateTag("projects");
    updateTag(`project:${project.slug}`);
    return undefined;
  });
}

/** Save the order of the project list (= order on /projects and the home carousel) */
export async function reorderProjects(ids: string[]): Promise<ActionResult<undefined>> {
  return asAdmin("reorderProjects", async (supabase) => {
    const list = z.array(z.uuid()).min(1).max(500).parse(ids);
    const results = await Promise.all(
      list.map((id, i) => supabase.from("projects").update({ sort_order: i + 1 }).eq("id", id)),
    );
    results.forEach(check);
    updateTag("projects");
    return undefined;
  });
}
