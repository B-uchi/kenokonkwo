import type { Metadata } from "next";
import { photos } from "@/lib/photos";
import PhotoGallery from "./gallery";

export const metadata: Metadata = {
  title: "Photographs",
};

// grid-only stand-ins until real photos arrive
const placeholders = [
  "placeholder photo",
  "placeholder photo",
  "placeholder photo",
  "placeholder photo",
  "placeholder photo",
];

export default function PhotosPage() {
  return (
    <div className="photos">
      <div className="page-head">
        <p className="eyebrow">Photographs</p>
        <h1 className="page-title">Moments we keep</h1>
      </div>

      <PhotoGallery photos={photos} placeholders={placeholders} />
    </div>
  );
}
