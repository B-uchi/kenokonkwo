import type { Metadata } from "next";
import SoundCheck from "./sound-check";

export const metadata: Metadata = {
  title: "Sound check",
  robots: { index: false, follow: false },
};

// Temporary diagnostics page — safe to delete once the audio issue is settled.
export default function SoundCheckPage() {
  return <SoundCheck />;
}
