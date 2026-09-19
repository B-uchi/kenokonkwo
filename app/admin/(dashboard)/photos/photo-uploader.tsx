"use client";

import { useRef, useState, type DragEvent } from "react";
import { MAX_PHOTO_BYTES, MAX_PHOTO_MB, PHOTO_TYPES } from "@/lib/photo-rules";
import { createPhotoUpload, savePhoto } from "../../actions";

type Job = {
  id: string;
  name: string;
  progress: number;
  status: "queued" | "preparing" | "uploading" | "saving" | "done" | "error";
  error?: string;
  note?: string;
};

const CONCURRENCY = 2;
/** camera photos are far larger than the site ever shows */
const MAX_EDGE = 2000;
const KEEP_ORIGINAL_UNDER = 1_200_000;

const readableSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));

type Prepared = { body: Blob; type: string; width: number; height: number };

/**
 * Shrink to a sensible size in the browser before uploading: smaller storage,
 * less transfer, and re-encoding drops camera metadata such as GPS location.
 */
async function prepare(file: File): Promise<Prepared> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const { width: fullWidth, height: fullHeight } = bitmap;
  const scale = Math.min(1, MAX_EDGE / Math.max(fullWidth, fullHeight));
  const original: Prepared = {
    body: file,
    type: file.type,
    width: fullWidth,
    height: fullHeight,
  };

  if (scale === 1 && file.size <= KEEP_ORIGINAL_UNDER) {
    bitmap.close();
    return original;
  }

  const width = Math.round(fullWidth * scale);
  const height = Math.round(fullHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return original;
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let encoded = await toBlob(canvas, "image/webp");
  if (encoded?.type !== "image/webp") encoded = await toBlob(canvas, "image/jpeg");
  // if shrinking somehow made it bigger, keep what the family picked
  if (!encoded || encoded.size >= file.size) return original;

  return { body: encoded, type: encoded.type, width, height };
}

/** PUT straight to R2 with progress (fetch has no upload progress). */
function putFile(
  url: string,
  body: Blob,
  type: string,
  onProgress: (p: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", type);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () =>
      xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(body);
  });
}

export default function PhotoUploader() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (id: string, patch: Partial<Job>) =>
    setJobs((all) => all.map((j) => (j.id === id ? { ...j, ...patch } : j)));

  async function upload(file: File, id: string) {
    try {
      if (!PHOTO_TYPES[file.type]) throw new Error("Use a JPEG, PNG, WebP or AVIF image.");

      update(id, { status: "preparing" });
      const { body, type, width, height } = await prepare(file);
      if (body.size > MAX_PHOTO_BYTES) throw new Error(`Larger than ${MAX_PHOTO_MB} MB.`);
      const note =
        body.size < file.size
          ? `${readableSize(file.size)} → ${readableSize(body.size)}`
          : readableSize(body.size);
      update(id, { status: "uploading", note });

      const ticket = await createPhotoUpload({ contentType: type, size: body.size });
      if (!ticket.ok) throw new Error(ticket.message);

      await putFile(ticket.url, body, type, (progress) => update(id, { progress }));
      update(id, { status: "saving", progress: 1 });

      const saved = await savePhoto({ key: ticket.key, width, height });
      if (!saved?.ok) throw new Error(saved?.message || "Could not save photo.");
      update(id, { status: "done" });
    } catch (error) {
      update(id, {
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  }

  async function addFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    const added = files.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      progress: 0,
      status: "queued" as const,
    }));
    setJobs((all) => [...added, ...all]);

    let next = 0;
    const worker = async () => {
      while (next < files.length) {
        const i = next++;
        await upload(files[i], added[i].id);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    void addFiles(e.dataTransfer.files);
  }

  const finished = jobs.some((j) => j.status === "done" || j.status === "error");
  const busy = jobs.some((j) => j.status === "queued" || j.status === "uploading" || j.status === "saving");

  return (
    <section className="admin-upload">
      <div
        className={dragging ? "admin-drop is-dragging" : "admin-drop"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <p>
          <strong>Drag photos here</strong> or
        </p>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => inputRef.current?.click()}
        >
          Choose photos
        </button>
        <p className="admin-hint">
          JPEG, PNG, WebP or AVIF · up to {MAX_PHOTO_MB} MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={Object.keys(PHOTO_TYPES).join(",")}
          multiple
          hidden
          onChange={(e) => {
            void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {jobs.length > 0 && (
        <ul className="admin-jobs" aria-live="polite">
          {jobs.map((j) => (
            <li key={j.id} className={`admin-job is-${j.status}`}>
              <span className="admin-job-name">{j.name}</span>
              <span className="admin-job-status">
                {j.status === "queued" && "Waiting…"}
                {j.status === "preparing" && "Preparing…"}
                {j.status === "uploading" && `${Math.round(j.progress * 100)}%`}
                {j.status === "saving" && "Saving…"}
                {j.status === "done" && "Added"}
                {j.status === "error" && j.error}
              </span>
              <span className="admin-job-bar" aria-hidden="true">
                <span style={{ transform: `scaleX(${j.progress})` }} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {finished && !busy && (
        <button
          type="button"
          className="admin-link"
          onClick={() => setJobs([])}
        >
          Clear list
        </button>
      )}
    </section>
  );
}
