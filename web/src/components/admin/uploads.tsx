"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { ImagePlus, RefreshCw, Trash2, Upload } from "lucide-react";
import {
  ACCEPT,
  newUploadPath,
  prepareImage,
  removeUploaded,
  runLimited,
  UploadError,
  uploadToStorage,
} from "@/lib/admin/upload";
import type { ActionResult } from "@/lib/admin/result";
import type { AdminImage, UploadedImage } from "@/lib/admin/types";
import { useToast } from "./Toaster";
import { Badge, inputClass } from "./ui";

// ---------------------------------------------------------------------------
// The upload pipeline as a hook: compress → upload (≤ 3 at a time, with
// progress) → record in the database. A failed record deletes the file again.
// ---------------------------------------------------------------------------

export interface UploadItem {
  key: string;
  name: string;
  progress: number;
  previewUrl?: string;
  stage: "preparing" | "uploading" | "saving";
}

type Recorder = (img: UploadedImage) => Promise<ActionResult<AdminImage>>;

export function useUploader(folder: string, onUploaded: (image: AdminImage) => void) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const toast = useToast();

  const patch = (key: string, p: Partial<UploadItem>) =>
    setItems((all) => all.map((i) => (i.key === key ? { ...i, ...p } : i)));

  const upload = useCallback(
    async (files: File[], record: Recorder) => {
      // Uploads run in parallel, but each photo is recorded only after the one
      // picked before it, so the gallery keeps the order they were chosen in
      const jobs = files.map((file) => {
        let done!: () => void;
        const recorded = new Promise<void>((resolve) => (done = resolve));
        return { file, key: crypto.randomUUID(), recorded, done };
      });
      setItems((all) => [...all, ...jobs.map(({ file, key }) => ({ key, name: file.name, progress: 0, stage: "preparing" as const }))]);

      await runLimited(jobs.map((job, i) => ({ ...job, previous: jobs[i - 1]?.recorded })), 3, async ({ file, key, previous, done }) => {
        let path: string | null = null;
        let previewUrl: string | undefined;
        try {
          const prepared = await prepareImage(file);
          previewUrl = prepared.previewUrl;
          patch(key, { previewUrl, stage: "uploading" });

          path = newUploadPath(folder);
          await uploadToStorage(path, prepared.blob, (progress) => patch(key, { progress }));
          patch(key, { stage: "saving" });

          await previous;
          const result = await record({ path, width: prepared.width, height: prepared.height });
          if (!result.ok) {
            await removeUploaded(path).catch(() => {});
            throw new UploadError(result.error);
          }
          onUploaded(result.data);
        } catch (error) {
          if (path && !(error instanceof UploadError)) await removeUploaded(path).catch(() => {});
          const reason = error instanceof UploadError ? error.message : "Couldn't upload — please try again.";
          toast.error(files.length > 1 ? `${file.name}: ${reason}` : reason);
        } finally {
          done();
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setItems((all) => all.filter((i) => i.key !== key));
        }
      });
    },
    [folder, onUploaded, toast],
  );

  return { items, upload, busy: items.length > 0 };
}

export function UploadProgress({ items }: { items: UploadItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-col gap-2" aria-live="polite">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-3 rounded-sm border border-line bg-paper p-2">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-stone">
            {item.previewUrl && (
              // A local blob URL, not something next/image can optimise
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.previewUrl} alt="" className="size-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-[13px] text-ink">{item.name}</p>
            <p className="font-sans text-xs text-muted">
              {item.stage === "preparing" ? "Preparing…" : item.stage === "saving" ? "Saving…" : `Uploading ${Math.round(item.progress * 100)}%`}
            </p>
            <div
              role="progressbar"
              aria-label={`Uploading ${item.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(item.progress * 100)}
              className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone"
            >
              <div className="h-full rounded-full bg-gold-deep transition-[width] duration-200" style={{ width: `${item.progress * 100}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// File pickers
// ---------------------------------------------------------------------------

interface DropZoneProps {
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  label: string;
  hint?: string;
  className?: string;
}

/** Tap to choose (phones), or drag photos onto it (desktop) */
export function DropZone({ multiple, disabled, onFiles, label, hint, className = "" }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (disabled) return;
        const files = [...e.dataTransfer.files];
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      className={`flex flex-col items-center justify-center rounded-sm border-2 border-dashed px-4 py-8 text-center transition-colors ${
        over ? "border-gold-deep bg-[#f6efe4]" : "border-line bg-paper"
      } ${className}`}
    >
      <ImagePlus aria-hidden className="size-7 text-gold-deep" />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm border border-line bg-white px-4 font-sans text-sm font-medium text-ink hover:border-gold-deep hover:text-gold-deep disabled:opacity-60"
      >
        <Upload aria-hidden className="size-4" /> {label}
      </button>
      <p className="mt-2 hidden font-sans text-[13px] text-muted md:block">or drag {multiple ? "photos" : "a photo"} here</p>
      {hint && <p className="mt-1 font-sans text-[13px] text-muted">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

/** A "Replace" button that opens the file picker for one photo */
export function ReplaceButton({ onFile, disabled, label = "Replace" }: { onFile: (f: File) => void; disabled?: boolean; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-sm border border-line bg-white px-3 font-sans text-[13px] text-ink hover:border-gold-deep hover:text-gold-deep disabled:opacity-60"
      >
        <RefreshCw aria-hidden className="size-3.5" /> {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// One photo: cover, before or after
// ---------------------------------------------------------------------------

interface ImageSlotProps {
  id: string;
  title: string;
  image: AdminImage | null;
  alt: string;
  onAltChange: (alt: string) => void;
  folder: string;
  record: Recorder;
  onUploaded: (image: AdminImage) => void;
  onRemove?: () => void;
  removing?: boolean;
  aspect?: string;
  emptyHint?: string;
}

export function ImageSlot({
  id,
  title,
  image,
  alt,
  onAltChange,
  folder,
  record,
  onUploaded,
  onRemove,
  removing,
  aspect = "aspect-[4/3]",
  emptyHint,
}: ImageSlotProps) {
  const { items, upload, busy } = useUploader(folder, onUploaded);
  const onFiles = (files: File[]) => upload(files.slice(0, 1), record);

  return (
    <div>
      <p className="mb-2 font-sans text-sm font-medium text-ink">{title}</p>
      {image ? (
        <>
          <div className={`relative overflow-hidden rounded-sm bg-stone ${aspect}`}>
            <Image src={image.url} alt="" fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <ReplaceButton onFile={(f) => onFiles([f])} disabled={busy || removing} />
            {onRemove && (
              <button
                type="button"
                disabled={busy || removing}
                onClick={onRemove}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-sm px-3 font-sans text-[13px] text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 aria-hidden className="size-3.5" /> Remove
              </button>
            )}
          </div>
          <label htmlFor={`${id}-alt`} className="mt-3 mb-1 block font-sans text-[13px] text-body">
            Description <span className="text-muted">(for screen readers and Google)</span>
          </label>
          <input
            id={`${id}-alt`}
            value={alt}
            maxLength={300}
            placeholder="e.g. Living room with timber screens"
            onChange={(e) => onAltChange(e.target.value)}
            className={inputClass}
          />
        </>
      ) : (
        !busy && <DropZone onFiles={onFiles} label="Choose photo" hint={emptyHint} className={aspect} />
      )}
      <UploadProgress items={items} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// A tile in a sortable photo grid (gallery, hero slides)
// ---------------------------------------------------------------------------

/** Landscape = width/height ≥ 1.2, the same rule the public gallery uses */
export const isWide = (img: { width: number; height: number }) => img.width / img.height >= 1.2;

export function PhotoTile({
  image,
  alt,
  onAltChange,
  handle,
  actions,
  showShape,
  label,
}: {
  image: AdminImage;
  alt: string;
  onAltChange: (alt: string) => void;
  handle: ReactNode;
  actions: ReactNode;
  showShape?: boolean;
  label: string;
}) {
  return (
    <div className="flex h-full flex-col rounded-sm border border-line bg-white p-2">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-stone">
        <Image src={image.url} alt="" fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw" className="object-contain" />
        {showShape && (
          <span className="absolute top-2 left-2">
            <Badge tone="grey">{isWide(image) ? "Wide" : "Tall"}</Badge>
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-1">
        {handle}
        <div className="flex items-center gap-1">{actions}</div>
      </div>
      <input
        aria-label={`Description for ${label}`}
        value={alt}
        maxLength={300}
        placeholder="Description (optional)"
        onChange={(e) => onAltChange(e.target.value)}
        className={`${inputClass} mt-1 py-2 text-sm`}
      />
    </div>
  );
}
