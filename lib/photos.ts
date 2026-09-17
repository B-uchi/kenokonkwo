import type { StaticImageData } from "next/image";
import portrait from "@/assets/ken-okonkwo.jpeg";
import flyer from "@/assets/memorial-flyer.png";

export type Photo = {
  id: string;
  src: StaticImageData;
  alt: string;
  /** focal point for cropped grid tiles */
  position?: string;
};

// Add new photos here: drop the file in /assets, import it, and append an entry.
export const photos: Photo[] = [
  {
    id: "portrait",
    src: portrait,
    alt: "Elder Chuka Ken Okonkwo",
    position: "50% 20%",
  },
  {
    id: "flyer",
    src: flyer,
    alt: "Memorial flyer",
    position: "50% 12%",
  },
];
