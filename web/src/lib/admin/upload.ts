// Browser side of photo uploads (cover, before/after, gallery, hero):
// compress → upload straight to Supabase Storage with the admin's session →
// a Server Action records the path. Never the secret key.
import imageCompression from "browser-image-compression";
import { browserClient } from "@/lib/supabase/browser";
import { MEDIA_BUCKET, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

export const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";
const MAX_INPUT_BYTES = 30 * 1024 * 1024;
const MAX_SIDE = 2400;
const QUALITY = 0.82;

export class UploadError extends Error {}

export interface PreparedImage {
  blob: Blob;
  width: number;
  height: number;
  /** Local preview URL (revoke when done) */
  previewUrl: string;
}

const isHeic = (file: File) => /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);

/**
 * Fix the orientation (EXIF), shrink to ≤ 2400px on the longest side, re-encode
 * as JPEG ~0.82 (which also drops all metadata, e.g. GPS) and read the final size.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  const supported = /^image\/(jpeg|png|webp)$/.test(file.type) || isHeic(file);
  if (!supported) throw new UploadError("Please choose a photo (JPG, PNG or WebP).");
  if (file.size > MAX_INPUT_BYTES) {
    throw new UploadError("This photo is over 30 MB. Please choose a smaller one.");
  }

  let output: File;
  try {
    output = await imageCompression(file, {
      maxWidthOrHeight: MAX_SIDE,
      fileType: "image/jpeg",
      initialQuality: QUALITY,
      maxSizeMB: 9, // under the 10 MB storage limit
      preserveExif: false,
      useWebWorker: false, // the worker would load a script from a CDN
    });
  } catch {
    throw new UploadError(
      isHeic(file)
        ? "This photo format isn't supported. Please export it as JPG and try again."
        : "This photo couldn't be read. Please try a different file.",
    );
  }
  if (output.type !== "image/jpeg") throw new UploadError("This photo couldn't be converted. Please export it as JPG and try again.");

  const bitmap = await createImageBitmap(output);
  const { width, height } = bitmap;
  bitmap.close();
  return { blob: output, width, height, previewUrl: URL.createObjectURL(output) };
}

/** A fresh, unguessable file name in the given folder */
export const newUploadPath = (folder: string) => `${folder}/${crypto.randomUUID()}.jpg`;

/**
 * Upload to the "media" bucket with progress (0–1). Uses XHR because fetch
 * can't report upload progress; the request is the same one supabase-js makes.
 */
export async function uploadToStorage(path: string, blob: Blob, onProgress: (p: number) => void) {
  const { data } = await browserClient().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new UploadError("Your login has expired. Please reload the page and log in again.");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${MEDIA_BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader("Content-Type", "image/jpeg");
    // Every path is unique, so the file never changes: cache it for a year
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new UploadError("The upload didn't go through. Please try again."));
    xhr.onerror = () => reject(new UploadError("The upload failed. Please check your connection and try again."));
    xhr.send(blob);
  });
  onProgress(1);
}

/** Clean up a file whose database record couldn't be saved */
export async function removeUploaded(path: string) {
  await browserClient().storage.from(MEDIA_BUCKET).remove([path]);
}

/** Run async jobs with at most `limit` at a time */
export async function runLimited<T>(items: T[], limit: number, job: (item: T) => Promise<void>) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await job(queue.shift()!);
  });
  await Promise.all(workers);
}
