"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/auth";
import { saveBiography } from "@/lib/server/biography";
import { sanitizeDoc } from "@/lib/rich-text";
import type { ActionState } from "@/lib/types";

/** Bodies arrive as JSON strings (plain data over the server-action wire). */
export type BiographyInput = {
  title: string;
  author: string;
  body: string;
  second: {
    title: string;
    author: string;
    body: string;
    visible: boolean;
  };
};

const clean = (value: string, max: number) => value.trim().slice(0, max);

export async function updateBiography(
  input: BiographyInput,
): Promise<ActionState> {
  await requireAdmin();

  const title = clean(input.title, 160);
  if (!title) return { ok: false, message: "Please give the page a title." };

  const secondTitle = clean(input.second.title, 160);
  if (input.second.visible && !secondTitle) {
    return {
      ok: false,
      message: "The second account needs a title before it can be shown.",
    };
  }

  let body: unknown;
  let secondBody: unknown;
  try {
    body = JSON.parse(input.body);
    secondBody = JSON.parse(input.second.body);
  } catch {
    return { ok: false, message: "Could not read the editor content." };
  }

  try {
    // strip anything outside the allowed tags — colours and pasted styling included
    await saveBiography({
      main: { title, author: clean(input.author, 120), body: sanitizeDoc(body) },
      second: {
        title: secondTitle,
        author: clean(input.second.author, 120),
        body: sanitizeDoc(secondBody),
        visible: input.second.visible,
      },
    });
  } catch (error) {
    console.error("updateBiography failed", error);
    return { ok: false, message: "Could not save. Please try again." };
  }

  revalidatePath("/bio");
  revalidatePath("/admin/biography");
  return { ok: true, message: "Saved" };
}
