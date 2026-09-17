"use server";

import { revalidatePath } from "next/cache";
import { createTribute } from "@/lib/server/tributes";
import type { ActionState } from "@/lib/types";

const text = (formData: FormData, key: string, max: number) =>
  String(formData.get(key) ?? "").trim().slice(0, max);

export async function submitTribute(formData: FormData): Promise<ActionState> {
  // honeypot: real visitors never see or fill this field
  if (text(formData, "website", 200)) return { ok: true, message: "" };

  const message = text(formData, "message", 2000);
  if (message.length < 2) {
    return { ok: false, message: "Please write a short message." };
  }

  try {
    await createTribute({
      name: text(formData, "name", 80) || "Anonymous",
      relation: text(formData, "relation", 60) || "Friend of the family",
      message,
    });
  } catch (error) {
    console.error("submitTribute failed", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/tributes");
  return { ok: true, message: "" };
}
