"use client";

import { useCallback, useState, useTransition } from "react";
import { X } from "lucide-react";
import { SortableArea, SortableItem } from "@/components/admin/Sortable";
import { useToast } from "@/components/admin/Toaster";
import { DropZone, PhotoTile, ReplaceButton, UploadProgress, useUploader } from "@/components/admin/uploads";
import { AdminButton } from "@/components/admin/ui";
import { useUnsavedChanges } from "@/components/admin/useUnsavedChanges";
import type { AdminImage } from "@/lib/admin/types";
import { addHeroSlide, removeHeroSlide, replaceHeroSlide, saveHeroSlides } from "../../_actions/media";

export default function HeroEditor({ initial }: { initial: AdminImage[] }) {
  const toast = useToast();
  // New and replaced photos are saved as soon as they upload; order and
  // descriptions are saved with the button
  const [slides, setSlides] = useState(initial);
  const [alts, setAlts] = useState(() => Object.fromEntries(initial.map((s) => [s.id, s.alt])));
  const [saved, setSaved] = useState(() => ({ order: initial.map((s) => s.id), alts: { ...alts } }));
  const [saving, startSaving] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dirty =
    slides.map((s) => s.id).join() !== saved.order.join() || JSON.stringify(alts) !== JSON.stringify(saved.alts);
  useUnsavedChanges(dirty);

  const onAdded = useCallback(
    (img: AdminImage) => {
      setSlides((all) => [...all, img]);
      setAlts((a) => ({ ...a, [img.id]: img.alt }));
      setSaved((s) => ({ order: [...s.order, img.id], alts: { ...s.alts, [img.id]: img.alt } }));
      toast.success("Slide added");
    },
    [toast],
  );
  const adder = useUploader("hero", onAdded);

  const onReplaced = useCallback(
    (img: AdminImage) => {
      setSlides((all) => all.map((s) => (s.id === img.id ? img : s)));
      toast.success("Photo replaced");
    },
    [toast],
  );
  const replacer = useUploader("hero", onReplaced);

  const remove = async (slide: AdminImage, n: number) => {
    if (slides.length <= 1) {
      toast.error("The home page needs at least one slide. Add another slide before removing this one.");
      return;
    }
    if (!window.confirm(`Remove slide ${n}? It will be deleted from the home page.`)) return;
    setBusyId(slide.id);
    const result = await removeHeroSlide(slide.id);
    setBusyId(null);
    if (!result.ok) return toast.error(result.error);
    setSlides((all) => all.filter((s) => s.id !== slide.id));
    const drop = (a: Record<string, string>) => Object.fromEntries(Object.entries(a).filter(([k]) => k !== slide.id));
    setAlts(drop);
    setSaved((s) => ({ order: s.order.filter((id) => id !== slide.id), alts: drop(s.alts) }));
    toast.success("Slide removed");
  };

  const save = () =>
    startSaving(async () => {
      const result = await saveHeroSlides(slides.map((s) => ({ id: s.id, alt: alts[s.id] ?? "" })));
      if (!result.ok) return toast.error(result.error);
      setSaved({ order: slides.map((s) => s.id), alts: { ...alts } });
      toast.success("Saved");
    });

  return (
    <div className="flex flex-col gap-6">
      {slides.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SortableArea items={slides} onReorder={setSlides} layout="grid">
            {slides.map((slide, i) => (
              <SortableItem key={slide.id} id={slide.id} label={`Move slide ${i + 1}`}>
                {(handle) => (
                  <div className="relative h-full">
                    <span className="absolute top-4 right-4 z-10 rounded-full bg-ink/80 px-2.5 py-0.5 font-sans text-xs text-white">
                      {i === 0 ? "1 · loads first" : i + 1}
                    </span>
                    <PhotoTile
                      image={slide}
                      label={`slide ${i + 1}`}
                      alt={alts[slide.id] ?? ""}
                      onAltChange={(a) => setAlts((all) => ({ ...all, [slide.id]: a }))}
                      handle={handle}
                      actions={
                        <>
                          <ReplaceButton
                            disabled={replacer.busy || busyId === slide.id}
                            onFile={(file) => replacer.upload([file], (img) => replaceHeroSlide(slide.id, img))}
                          />
                          <button
                            type="button"
                            aria-label={`Remove slide ${i + 1}`}
                            disabled={busyId === slide.id}
                            onClick={() => remove(slide, i + 1)}
                            className="flex size-11 items-center justify-center rounded-sm text-muted hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                          >
                            <X aria-hidden className="size-5" />
                          </button>
                        </>
                      }
                    />
                  </div>
                )}
              </SortableItem>
            ))}
          </SortableArea>
        </div>
      )}
      <UploadProgress items={replacer.items} />

      <div>
        <DropZone
          multiple
          onFiles={(files) => adder.upload(files, addHeroSlide)}
          label="Add slides"
          hint="Wide landscape photos, at least 2000px wide."
        />
        <UploadProgress items={adder.items} />
      </div>

      <div className="sticky bottom-0 z-40 -mx-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-sm md:border md:px-5">
        <div className="flex items-center justify-between gap-3">
          <p className="hidden font-sans text-sm text-muted sm:block">
            {dirty ? "Press Save to keep the new order and descriptions." : "All changes saved."}
          </p>
          <AdminButton onClick={save} pending={saving} disabled={!dirty} className="flex-1 sm:flex-none sm:px-8">
            {saving ? "Saving…" : "Save"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
