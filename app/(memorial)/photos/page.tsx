import type { Metadata } from "next";
import { getPhotos } from "@/lib/server/photos";
import PhotoGallery from "./gallery";

export const metadata: Metadata = {
  title: "Photographs",
};

export default async function PhotosPage() {
  const photos = (await getPhotos()).map(({ id, url, width, height, caption }) => ({
    id,
    url,
    width,
    height,
    caption,
  }));

  return (
    <div className="photos">
      <div className="page-head">
        <p className="eyebrow">Photographs</p>
        <h1 className="page-title">Moments we keep</h1>
      </div>

      {photos.length > 0 ? (
        <PhotoGallery photos={photos} />
      ) : (
        <p className="photos-empty">Photographs will be shared here soon.</p>
      )}
    </div>
  );
}
