"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/auth";
import { saveBiography } from "@/lib/server/biography";
import { sanitizeDoc } from "@/lib/rich-text";
import type { ActionState } from "@/lib/types";

/** `body` is the editor document as a JSON string (plain data over the wire). */
export async function updateBiography(input: {
  title: string;
  body: string;
}): Promise<ActionState> {
  await requireAdmin();

  const title = input.title.trim().slice(0, 120);
  if (!title) return { ok: false, message: "Please give the page a title." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(input.body);
  } catch {
    return { ok: false, message: "Could not read the editor content." };
  }

  try {
    // strip anything outside the allowed tags — colours and pasted styling included
    await saveBiography(title, sanitizeDoc(parsed));
  } catch (error) {
    console.error("updateBiography failed", error);
    return { ok: false, message: "Could not save. Please try again." };
  }

  revalidatePath("/bio");
  revalidatePath("/admin/biography");
  return { ok: true, message: "Saved" };
}
