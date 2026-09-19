"use server";

import { revalidatePath } from "next/cache";
import { createRsvp } from "@/lib/server/rsvps";
import type { ActionState } from "@/lib/types";

const text = (formData: FormData, key: string, max: number) =>
  String(formData.get(key) ?? "").trim().slice(0, max);

export async function submitRsvp(formData: FormData): Promise<ActionState> {
  // honeypot: real visitors never see or fill this field
  if (text(formData, "website", 200)) return { ok: true, message: "" };

  const name = text(formData, "name", 80);
  const phone = text(formData, "phone", 40);
  if (!name) return { ok: false, message: "Please add your name." };
  if (!phone) return { ok: false, message: "Please add a phone number." };

  const guests = Number(formData.get("guests") ?? 1);

  try {
    await createRsvp({
      name,
      phone,
      email: text(formData, "email", 120),
      guests: Number.isInteger(guests) && guests > 0 && guests <= 50 ? guests : 1,
    });
  } catch (error) {
    console.error("submitRsvp failed", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/rsvps");
  return { ok: true, message: "" };
}
