"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkCredentials,
  createSession,
  destroySession,
  requireAdmin,
} from "@/lib/server/auth";
import {
  deletePhotoRow,
  getPhotoKey,
  insertPhoto,
  movePhoto,
  updateCaption,
} from "@/lib/server/photos";
import { deleteObject, headObject, presignUpload } from "@/lib/server/r2";
import {
  deleteTribute,
  setTributeStatus,
} from "@/lib/server/tributes";
import { deleteRsvp, getAllRsvps } from "@/lib/server/rsvps";
import { MAX_PHOTO_BYTES, MAX_PHOTO_MB, PHOTO_TYPES } from "@/lib/photo-rules";
import type { ActionState, TributeStatus } from "@/lib/types";

// Every action re-checks the session: server actions are public POST endpoints.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function idFrom(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) throw new Error("Invalid id");
  return id;
}

/* ---------------- session ---------------- */

type LoginState = (ActionState & { username?: string }) | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!checkCredentials(username, password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { ok: false, message: "Incorrect username or password.", username };
  }

  await createSession();
  redirect("/admin/tributes");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------------- tributes ---------------- */

function refreshTributes() {
  revalidatePath("/tributes");
  revalidatePath("/memorial");
  revalidatePath("/admin/tributes");
}

async function changeStatus(formData: FormData, status: TributeStatus) {
  await requireAdmin();
  await setTributeStatus(idFrom(formData), status);
  refreshTributes();
}

export async function approveTribute(formData: FormData) {
  await changeStatus(formData, "approved");
}

export async function hideTribute(formData: FormData) {
  await changeStatus(formData, "hidden");
}

export async function removeTribute(formData: FormData) {
  await requireAdmin();
  await deleteTribute(idFrom(formData));
  refreshTributes();
}

/* ---------------- photos ---------------- */

function refreshPhotos() {
  revalidatePath("/photos");
  revalidatePath("/admin/photos");
}

type UploadTicket =
  | { ok: true; key: string; url: string }
  | { ok: false; message: string };

export async function createPhotoUpload(input: {
  contentType: string;
  size: number;
}): Promise<UploadTicket> {
  await requireAdmin();
  const ext = PHOTO_TYPES[input.contentType];
  if (!ext) return { ok: false, message: "Use a JPEG, PNG, WebP or AVIF image." };
  if (!(input.size > 0 && input.size <= MAX_PHOTO_BYTES)) {
    return { ok: false, message: `Photos must be under ${MAX_PHOTO_MB} MB.` };
  }
  const key = `photos/${randomUUID()}.${ext}`;
  return { ok: true, key, url: await presignUpload(key, input.contentType) };
}

const KEY = /^photos\/[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;

export async function savePhoto(input: {
  key: string;
  width: number;
  height: number;
}): Promise<ActionState> {
  await requireAdmin();
  const { key, width, height } = input;
  const validSize = (n: number) => Number.isInteger(n) && n > 0 && n <= 20000;
  if (!KEY.test(key) || !validSize(width) || !validSize(height)) {
    return { ok: false, message: "Invalid upload." };
  }

  // trust what actually landed in the bucket, not what the browser claimed
  const object = await headObject(key);
  if (!object) return { ok: false, message: "Upload not found. Please try again." };
  if (object.size > MAX_PHOTO_BYTES || !PHOTO_TYPES[object.contentType]) {
    await deleteObject(key);
    return { ok: false, message: "That file isn't a supported image." };
  }

  await insertPhoto({ key, width, height, caption: "" });
  refreshPhotos();
  return { ok: true, message: "" };
}

export async function saveCaption(formData: FormData) {
  await requireAdmin();
  const caption = String(formData.get("caption") ?? "").trim().slice(0, 200);
  await updateCaption(idFrom(formData), caption);
  refreshPhotos();
}

export async function movePhotoUp(formData: FormData) {
  await requireAdmin();
  await movePhoto(idFrom(formData), -1);
  refreshPhotos();
}

export async function movePhotoDown(formData: FormData) {
  await requireAdmin();
  await movePhoto(idFrom(formData), 1);
  refreshPhotos();
}

export async function deletePhoto(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const key = await getPhotoKey(id);
  if (!key) return;
  // remove the row first so the site never points at a missing file
  await deletePhotoRow(id);
  refreshPhotos();
  try {
    await deleteObject(key);
  } catch (error) {
    console.error("R2 delete failed; object left orphaned", key, error);
  }
}

/* ---------------- rsvps ---------------- */

export async function removeRsvp(formData: FormData) {
  await requireAdmin();
  await deleteRsvp(idFrom(formData));
  revalidatePath("/admin/rsvps");
}

/** Spreadsheet-ready list of everyone who replied. */
export async function rsvpCsv() {
  await requireAdmin();
  const rows = await getAllRsvps();
  const cell = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;
  return [
    ["Name", "Phone", "Email", "People", "Replied"].map(cell).join(","),
    ...rows.map((r) =>
      [r.name, r.phone, r.email, r.guests, r.createdAt].map(cell).join(","),
    ),
  ].join("\n");
}
