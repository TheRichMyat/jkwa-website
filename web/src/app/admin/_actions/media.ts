"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { asAdmin, check, row as one, UserError } from "@/lib/admin/action";
import { isUploadPath, objectExists, removeObjects } from "@/lib/admin/media";
import { toAdminImage } from "@/lib/admin/queries";
import type { ActionResult } from "@/lib/admin/result";
import type { AdminImage, ImageKind, UploadedImage } from "@/lib/admin/types";

// Photos are recorded here right after the browser has uploaded them. Each
// action checks the upload landed in the right folder, and if the database
// write fails it deletes the file again, so storage never fills with orphans.

const uploaded = z.object({
  path: z.string().max(200),
  width: z.int().positive().max(20000),
  height: z.int().positive().max(20000),
  alt: z.string().trim().max(300).optional(),
});

const uuid = z.uuid();
const kind = z.enum(["cover", "gallery", "before", "after"]);

const IMAGE_COLUMNS = "id, image_path, alt, width, height";

/** Validate an upload for this folder; on any later failure the file is removed */
async function withUpload<T>(
  supabase: SupabaseClient,
  input: UploadedImage,
  folder: string,
  save: (img: z.infer<typeof uploaded>) => Promise<T>,
): Promise<T> {
  const img = uploaded.parse(input);
  if (!isUploadPath(img.path, folder)) throw new UserError("That upload isn't valid. Please try again.");
  if (!(await objectExists(supabase, img.path))) {
    throw new UserError("The upload didn't finish. Please try again.");
  }
  try {
    return await save(img);
  } catch (error) {
    await removeObjects(supabase, [img.path]);
    throw error;
  }
}

function tagProject(slug: string) {
  updateTag("projects");
  updateTag(`project:${slug}`);
}

// ---------------------------------------------------------------------------
// Project photos
// ---------------------------------------------------------------------------

/**
 * Add a photo to a project. Cover / before / after replace the existing one
 * (the old file is deleted); gallery photos are added at the end.
 */
export async function addProjectImage(
  projectId: string,
  imageKind: ImageKind,
  input: UploadedImage,
): Promise<ActionResult<AdminImage>> {
  return asAdmin("addProjectImage", async (supabase) => {
    const id = uuid.parse(projectId);
    const k = kind.parse(imageKind);

    return withUpload(supabase, input, `projects/${id}`, async (img) => {
      const { data: project } = check(
        await supabase.from("projects").select("slug").eq("id", id).maybeSingle(),
      );
      if (!project) throw new UserError("This project no longer exists.");

      let row: Parameters<typeof toAdminImage>[0];
      if (k === "gallery") {
        const { data: last } = check(
          await supabase
            .from("project_images")
            .select("sort_order")
            .eq("project_id", id)
            .eq("kind", "gallery")
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle(),
        );
        row = one(
          await supabase
            .from("project_images")
            .insert({
              project_id: id,
              kind: k,
              image_path: img.path,
              width: img.width,
              height: img.height,
              alt: img.alt ?? "",
              sort_order: (last?.sort_order ?? 0) + 1,
            })
            .select(IMAGE_COLUMNS)
            .single(),
        );
      } else {
        const { data: existing } = check(
          await supabase
            .from("project_images")
            .select("id, image_path, alt")
            .eq("project_id", id)
            .eq("kind", k)
            .maybeSingle(),
        );
        if (existing) {
          // Replace in place (one cover/before/after per project), keeping the description
          row = one(
            await supabase
              .from("project_images")
              .update({ image_path: img.path, width: img.width, height: img.height, alt: img.alt ?? existing.alt })
              .eq("id", existing.id)
              .select(IMAGE_COLUMNS)
              .single(),
          );
          await removeObjects(supabase, [existing.image_path]);
        } else {
          row = one(
            await supabase
              .from("project_images")
              .insert({
                project_id: id,
                kind: k,
                image_path: img.path,
                width: img.width,
                height: img.height,
                alt: img.alt ?? "",
              })
              .select(IMAGE_COLUMNS)
              .single(),
          );
        }
      }

      tagProject(project.slug);
      return toAdminImage(row);
    });
  });
}

export async function removeProjectImage(imageId: string): Promise<ActionResult<undefined>> {
  return asAdmin("removeProjectImage", async (supabase) => {
    const id = uuid.parse(imageId);
    const { data: image } = check(
      await supabase
        .from("project_images")
        .select("id, kind, image_path, projects(slug)")
        .eq("id", id)
        .maybeSingle(),
    );
    if (!image) return undefined; // already gone
    if (image.kind === "cover") throw new UserError("The cover photo can be replaced, but not removed.");

    check(await supabase.from("project_images").delete().eq("id", id));
    await removeObjects(supabase, [image.image_path]);
    const project = image.projects as unknown as { slug: string } | null;
    if (project) tagProject(project.slug);
    return undefined;
  });
}

// ---------------------------------------------------------------------------
// Hero slides
// ---------------------------------------------------------------------------

export async function addHeroSlide(input: UploadedImage): Promise<ActionResult<AdminImage>> {
  return asAdmin("addHeroSlide", async (supabase) =>
    withUpload(supabase, input, "hero", async (img) => {
      const { data: last } = check(
        await supabase
          .from("hero_slides")
          .select("sort_order")
          .order("sort_order", { ascending: false })
          .limit(1)
          .maybeSingle(),
      );
      const row = one(
        await supabase
          .from("hero_slides")
          .insert({
            image_path: img.path,
            width: img.width,
            height: img.height,
            alt: img.alt ?? "",
            sort_order: (last?.sort_order ?? 0) + 1,
          })
          .select(IMAGE_COLUMNS)
          .single(),
      );
      updateTag("hero-slides");
      return toAdminImage(row);
    }),
  );
}

export async function replaceHeroSlide(slideId: string, input: UploadedImage): Promise<ActionResult<AdminImage>> {
  return asAdmin("replaceHeroSlide", async (supabase) => {
    const id = uuid.parse(slideId);
    return withUpload(supabase, input, "hero", async (img) => {
      const { data: existing } = check(
        await supabase.from("hero_slides").select("image_path").eq("id", id).maybeSingle(),
      );
      if (!existing) throw new UserError("This slide no longer exists.");
      const row = one(
        await supabase
          .from("hero_slides")
          .update({ image_path: img.path, width: img.width, height: img.height })
          .eq("id", id)
          .select(IMAGE_COLUMNS)
          .single(),
      );
      await removeObjects(supabase, [existing.image_path]);
      updateTag("hero-slides");
      return toAdminImage(row);
    });
  });
}

export async function removeHeroSlide(slideId: string): Promise<ActionResult<undefined>> {
  return asAdmin("removeHeroSlide", async (supabase) => {
    const id = uuid.parse(slideId);
    const { count } = check(await supabase.from("hero_slides").select("id", { count: "exact", head: true }));
    if ((count ?? 0) <= 1) {
      throw new UserError("The home page needs at least one slide. Add another slide before removing this one.");
    }
    const { data: slide } = check(
      await supabase.from("hero_slides").delete().eq("id", id).select("image_path").maybeSingle(),
    );
    if (slide) await removeObjects(supabase, [slide.image_path]);
    updateTag("hero-slides");
    return undefined;
  });
}

const slideList = z
  .array(z.object({ id: z.uuid(), alt: z.string().trim().max(300) }))
  .min(1)
  .max(50);

/** Save the slide order (list order) and descriptions */
export async function saveHeroSlides(items: { id: string; alt: string }[]): Promise<ActionResult<undefined>> {
  return asAdmin("saveHeroSlides", async (supabase) => {
    const slides = slideList.parse(items);
    const results = await Promise.all(
      slides.map((s, i) => supabase.from("hero_slides").update({ alt: s.alt, sort_order: i + 1 }).eq("id", s.id)),
    );
    results.forEach(check);
    updateTag("hero-slides");
    return undefined;
  });
}
