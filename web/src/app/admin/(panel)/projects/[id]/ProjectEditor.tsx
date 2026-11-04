"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Eye, Trash2, X } from "lucide-react";
import BasicsFields, { type Basics } from "@/components/admin/BasicsFields";
import { SortableArea, SortableItem } from "@/components/admin/Sortable";
import { useToast } from "@/components/admin/Toaster";
import { DropZone, ImageSlot, PhotoTile, UploadProgress, useUploader } from "@/components/admin/uploads";
import { AdminButton, Field, inputClass, Section, Switch, focusFirstError } from "@/components/admin/ui";
import { useUnsavedChanges } from "@/components/admin/useUnsavedChanges";
import type { AdminImage, AdminProject, ImageKind } from "@/lib/admin/types";
import { addProjectImage, removeProjectImage } from "../../../_actions/media";
import { deleteProject, saveProject } from "../../../_actions/projects";
import AutoGrowTextarea from "./AutoGrowTextarea";
import DeleteDialog from "./DeleteDialog";

interface FormFields extends Basics {
  propertyType: string;
  sizeSqft: string;
  duration: string;
  scope: string;
  year: string;
  storyHeading: string;
  storyBody: string;
  published: boolean;
  featured: boolean;
}

const STORY_MAX = 10_000;

function initialFields(p: AdminProject): FormFields {
  return {
    title: p.title,
    category: p.category,
    location: p.location,
    slug: p.slug,
    propertyType: p.propertyType,
    sizeSqft: p.sizeSqft?.toString() ?? "",
    duration: p.duration,
    scope: p.scope,
    year: p.year?.toString() ?? "",
    storyHeading: p.storyHeading,
    storyBody: p.storyBody,
    published: p.published,
    featured: p.featured,
  };
}

function initialAlts(p: AdminProject) {
  const all = [p.cover, p.before, p.after, ...p.gallery].filter((img): img is AdminImage => img !== null);
  return Object.fromEntries(all.map((img) => [img.id, img.alt]));
}

export default function ProjectEditor({ project }: { project: AdminProject }) {
  const router = useRouter();
  const toast = useToast();
  const folder = `projects/${project.id}`;

  // Photos are saved the moment they upload (or are removed). Text, switches,
  // descriptions and the gallery order are saved with the Save button.
  const [fields, setFields] = useState(() => initialFields(project));
  const [alts, setAlts] = useState<Record<string, string>>(() => initialAlts(project));
  const [cover, setCover] = useState(project.cover);
  const [before, setBefore] = useState(project.before);
  const [after, setAfter] = useState(project.after);
  const [gallery, setGallery] = useState(project.gallery);

  // What's in the database, to tell whether anything is unsaved
  const [saved, setSaved] = useState(() => ({
    fields: initialFields(project),
    alts: initialAlts(project),
    order: project.gallery.map((g) => g.id),
  }));
  const [liveSlug, setLiveSlug] = useState(project.published ? project.slug : undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const order = gallery.map((g) => g.id);
  const dirty =
    JSON.stringify(fields) !== JSON.stringify(saved.fields) ||
    JSON.stringify(alts) !== JSON.stringify(saved.alts) ||
    order.join() !== saved.order.join();
  useUnsavedChanges(dirty);

  const set = (patch: Partial<FormFields>) => {
    setFields((f) => ({ ...f, ...patch }));
    setErrors((e) => (Object.keys(e).length ? {} : e));
  };
  const setAlt = (id: string, alt: string) => setAlts((a) => ({ ...a, [id]: alt }));

  /** A photo was stored: count its description as saved (a replaced photo keeps the one being typed) */
  const remember = useCallback((img: AdminImage, replaced?: AdminImage | null) => {
    setAlts((a) => ({ ...a, [img.id]: replaced?.id === img.id ? (a[img.id] ?? img.alt) : img.alt }));
    setSaved((s) => ({ ...s, alts: { ...s.alts, [img.id]: img.alt } }));
  }, []);

  const recorder = (kind: ImageKind) => (img: Parameters<typeof addProjectImage>[2]) =>
    addProjectImage(project.id, kind, img);

  const onCover = (img: AdminImage) => {
    remember(img, cover);
    setCover(img);
    toast.success("Cover photo saved");
  };
  const onBefore = (img: AdminImage) => {
    remember(img, before);
    setBefore(img);
    toast.success("Before photo saved");
  };
  const onAfter = (img: AdminImage) => {
    remember(img, after);
    setAfter(img);
    toast.success("After photo saved");
  };
  const onGalleryPhoto = useCallback(
    (img: AdminImage) => {
      setGallery((g) => [...g, img]);
      setSaved((s) => ({ ...s, order: [...s.order, img.id] }));
      remember(img);
    },
    [remember],
  );
  const galleryUploader = useUploader(folder, onGalleryPhoto);

  const removeImage = async (img: AdminImage, what: string, done: () => void) => {
    if (!window.confirm(`Remove this ${what}? It will be deleted from the website.`)) return;
    setRemovingId(img.id);
    const result = await removeProjectImage(img.id);
    setRemovingId(null);
    if (!result.ok) return toast.error(result.error);
    done();
    const drop = (a: Record<string, string>) => Object.fromEntries(Object.entries(a).filter(([k]) => k !== img.id));
    setAlts(drop);
    setSaved((s) => ({ ...s, alts: drop(s.alts), order: s.order.filter((id) => id !== img.id) }));
    toast.success("Photo removed");
  };

  const save = () => {
    if (Boolean(before) !== Boolean(after)) {
      toast.error("Before & After needs both photos. Add the missing one, or remove the one you added.");
      document.getElementById("before-after")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (fields.published && !cover) {
      toast.error("Add a cover photo before making the project visible on the website.");
      return;
    }
    startSaving(async () => {
      const result = await saveProject(project.id, {
        ...fields,
        category: fields.category as "residential" | "commercial",
        alts,
        galleryOrder: order,
      });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        focusFirstError();
        toast.error(result.error);
        return;
      }
      setErrors({});
      setSaved({ fields, alts, order });
      setLiveSlug(fields.published ? result.data.slug : undefined);
      toast.success("Saved");
      router.refresh();
    });
  };

  const onDelete = async (typedTitle: string) => {
    const result = await deleteProject(project.id, typedTitle);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    setSaved({ fields, alts, order }); // nothing left to warn about
    toast.success("Project deleted");
    router.push("/admin/projects");
    return true;
  };

  const preview = () => {
    if (dirty) toast.error("Save first to see your latest changes in the preview.");
    window.open(`/admin/projects/${project.id}/preview`, "_blank", "noopener");
  };

  return (
    <>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      noValidate
      className="flex flex-col gap-6"
    >
      <h1 className="font-display text-[2rem] font-normal leading-tight text-ink md:text-[2.5rem]">
        {fields.title || "Untitled project"}
      </h1>

      {/* 1. Basics */}
      <Section title="Basics">
        <BasicsFields
          value={fields}
          onChange={(b) => set(b)}
          errors={errors}
          autoSlug={false}
          liveSlug={liveSlug}
        />
      </Section>

      {/* 2. Cover */}
      <Section title="Cover photo" description="The large photo at the top of the project page, also used on the Projects page and the home page.">
        <div className="max-w-xl">
          <ImageSlot
            id="cover"
            title={cover ? "Current cover" : "Add a cover photo (required)"}
            image={cover}
            alt={cover ? (alts[cover.id] ?? "") : ""}
            onAltChange={(a) => cover && setAlt(cover.id, a)}
            folder={folder}
            record={recorder("cover")}
            onUploaded={onCover}
            aspect="aspect-[16/9]"
            emptyHint="A wide (landscape) photo works best."
          />
        </div>
      </Section>

      {/* 3. Facts */}
      <Section title="Project facts" description="All optional. Leave empty to hide.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Property type" htmlFor="propertyType" hint="e.g. Landed House, Condominium, Office">
            <input id="propertyType" value={fields.propertyType} maxLength={120} onChange={(e) => set({ propertyType: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Size (sq ft)" htmlFor="sizeSqft" error={errors.sizeSqft} hint="Numbers only, e.g. 3200">
            <input
              id="sizeSqft"
              inputMode="numeric"
              value={fields.sizeSqft}
              maxLength={9}
              aria-invalid={Boolean(errors.sizeSqft) || undefined}
              onChange={(e) => set({ sizeSqft: e.target.value.replace(/[^\d,]/g, "") })}
              className={inputClass}
            />
          </Field>
          <Field label="Duration" htmlFor="duration" hint="e.g. 16 Weeks">
            <input id="duration" value={fields.duration} maxLength={120} onChange={(e) => set({ duration: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Scope" htmlFor="scope" hint="e.g. Full Renovation">
            <input id="scope" value={fields.scope} maxLength={160} onChange={(e) => set({ scope: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Year" htmlFor="year" error={errors.year} hint="e.g. 2025">
            <input
              id="year"
              inputMode="numeric"
              value={fields.year}
              maxLength={4}
              aria-invalid={Boolean(errors.year) || undefined}
              onChange={(e) => set({ year: e.target.value.replace(/\D/g, "") })}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* 4. Story */}
      <Section title="Story" description="Optional. Leave empty to hide.">
        <div className="flex flex-col gap-5">
          <Field label="Heading" htmlFor="storyHeading" error={errors.storyHeading} hint="e.g. A Home Shaped by Light and Calm">
            <input id="storyHeading" value={fields.storyHeading} maxLength={160} onChange={(e) => set({ storyHeading: e.target.value })} className={inputClass} />
          </Field>
          <Field
            label="Text"
            htmlFor="storyBody"
            error={errors.storyBody}
            hint={
              <>
                Press Enter twice to start a new paragraph. Web addresses become links automatically.
                <span className="float-right tabular-nums">
                  {fields.storyBody.length.toLocaleString()} / {STORY_MAX.toLocaleString()}
                </span>
              </>
            }
          >
            <AutoGrowTextarea
              id="storyBody"
              value={fields.storyBody}
              maxLength={STORY_MAX}
              onChange={(e) => set({ storyBody: e.target.value })}
              className={`${inputClass} min-h-40 leading-relaxed`}
            />
          </Field>
        </div>
      </Section>

      {/* 5. Before & After */}
      <Section title="Before & After" description="Optional. Add both photos to show the slider.">
        <div id="before-after" className="grid gap-6 sm:grid-cols-2">
          <ImageSlot
            id="before"
            title="Before"
            image={before}
            alt={before ? (alts[before.id] ?? "") : ""}
            onAltChange={(a) => before && setAlt(before.id, a)}
            folder={folder}
            record={recorder("before")}
            onUploaded={onBefore}
            onRemove={before ? () => removeImage(before, "before photo", () => setBefore(null)) : undefined}
            removing={removingId === before?.id}
          />
          <ImageSlot
            id="after"
            title="After"
            image={after}
            alt={after ? (alts[after.id] ?? "") : ""}
            onAltChange={(a) => after && setAlt(after.id, a)}
            folder={folder}
            record={recorder("after")}
            onUploaded={onAfter}
            onRemove={after ? () => removeImage(after, "after photo", () => setAfter(null)) : undefined}
            removing={removingId === after?.id}
          />
        </div>
        {Boolean(before) !== Boolean(after) && (
          <p role="alert" className="mt-4 font-sans text-sm text-amber-800">
            Add the {before ? "After" : "Before"} photo too, or the slider won&apos;t show.
          </p>
        )}
      </Section>

      {/* 6. Gallery */}
      <Section
        title="Gallery photos"
        description="The website arranges photos automatically. Wide photos fill a row, tall photos sit side by side. Just put them in the order you like."
      >
        {gallery.length > 0 && (
          <div className="mb-5 grid grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-4">
            <SortableArea items={gallery} onReorder={setGallery} layout="grid">
              {gallery.map((img, i) => (
                <SortableItem key={img.id} id={img.id} label={`Move photo ${i + 1}`}>
                  {(handle) => (
                    <PhotoTile
                      image={img}
                      label={`photo ${i + 1}`}
                      alt={alts[img.id] ?? ""}
                      onAltChange={(a) => setAlt(img.id, a)}
                      handle={handle}
                      showShape
                      actions={
                        <button
                          type="button"
                          aria-label={`Remove photo ${i + 1}`}
                          disabled={removingId === img.id}
                          onClick={() => removeImage(img, "photo", () => setGallery((g) => g.filter((x) => x.id !== img.id)))}
                          className="flex size-11 items-center justify-center rounded-sm text-muted hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        >
                          <X aria-hidden className="size-5" />
                        </button>
                      }
                    />
                  )}
                </SortableItem>
              ))}
            </SortableArea>
          </div>
        )}
        <DropZone
          multiple
          onFiles={(files) => galleryUploader.upload(files, recorder("gallery"))}
          label={gallery.length ? "Add more photos" : "Choose photos"}
          hint="You can select several at once."
        />
        <UploadProgress items={galleryUploader.items} />
      </Section>

      {/* 7. Visibility */}
      <Section title="Visibility">
        <div className="flex flex-col gap-5">
          <Switch
            id="published"
            label="Visible on website"
            description={fields.published ? "Everyone can see this project." : "Draft: only you can see it, in the preview."}
            checked={fields.published}
            onChange={(published) => set({ published })}
          />
          <Switch
            id="featured"
            label="Show on home page"
            description="Adds the cover photo to the Portfolio carousel on the home page (when the project is visible)."
            checked={fields.featured}
            onChange={(featured) => set({ featured })}
          />
        </div>
      </Section>

      {/* Save bar: sticks to the bottom of the screen while scrolling */}
      <div className="sticky bottom-0 z-40 -mx-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-sm md:border md:px-5">
        <div className="flex items-center justify-between gap-3">
          <p className="hidden font-sans text-sm text-muted sm:block">{dirty ? "You have unsaved changes." : "All changes saved."}</p>
          <div className="flex flex-1 gap-3 sm:flex-none">
            <AdminButton variant="secondary" onClick={preview} className="flex-1 sm:flex-none">
              <Eye aria-hidden className="size-4" /> Preview
            </AdminButton>
            <AdminButton type="submit" pending={saving} disabled={galleryUploader.busy} className="flex-[2] sm:flex-none sm:px-8">
              {saving ? "Saving…" : "Save"}
            </AdminButton>
          </div>
        </div>
      </div>
    </form>

      {/* Danger zone (outside the form: the dialog has its own) */}
      <section className="mt-6 rounded-sm border border-red-200 bg-red-50/40 p-5 md:p-7">
        <h2 className="font-sans text-lg font-medium text-red-800">Danger zone</h2>
        <p className="mt-1 font-sans text-sm text-body">
          Deleting removes the project and all its photos for good. This can&apos;t be undone.
        </p>
        <AdminButton variant="danger" className="mt-4" onClick={() => setDeleteOpen(true)}>
          <Trash2 aria-hidden className="size-4" /> Delete project
        </AdminButton>
      </section>

      <DeleteDialog
        open={deleteOpen}
        title={saved.fields.title}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDelete}
      />
    </>
  );
}
