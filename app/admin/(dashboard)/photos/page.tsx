import type { Metadata } from "next";
import Image from "next/image";
import { requireAdmin } from "@/lib/server/auth";
import { getPhotos } from "@/lib/server/photos";
import {
  deletePhoto,
  movePhotoDown,
  movePhotoUp,
  saveCaption,
} from "../../actions";
import SubmitButton from "../submit-button";
import PhotoUploader from "./photo-uploader";

export const metadata: Metadata = {
  title: "Photos",
};

export default async function AdminPhotosPage() {
  await requireAdmin();
  const photos = await getPhotos();

  return (
    <>
      <div className="admin-title">
        <h1>Photos</h1>
        <p>
          {photos.length} {photos.length === 1 ? "photo" : "photos"} in the
          gallery. The order here is the order visitors see.
        </p>
      </div>

      <PhotoUploader />

      {photos.length === 0 ? (
        <p className="admin-empty">No photos yet — add some above.</p>
      ) : (
        <ol className="admin-list">
          {photos.map((p, i) => (
            <li key={p.id} className="admin-card admin-photo">
              <div className="admin-thumb">
                <Image src={p.url} alt={p.caption} fill sizes="112px" />
              </div>

              <form action={saveCaption} className="admin-caption">
                <input type="hidden" name="id" value={p.id} />
                <label className="sr-only" htmlFor={`caption-${p.id}`}>
                  Caption
                </label>
                <input
                  id={`caption-${p.id}`}
                  className="field"
                  name="caption"
                  defaultValue={p.caption}
                  placeholder="Add a caption (optional)"
                  maxLength={200}
                />
                <SubmitButton>Save</SubmitButton>
              </form>

              <div className="admin-actions">
                <form action={movePhotoUp}>
                  <input type="hidden" name="id" value={p.id} />
                  <SubmitButton label="Move up" disabled={i === 0}>↑</SubmitButton>
                </form>
                <form action={movePhotoDown}>
                  <input type="hidden" name="id" value={p.id} />
                  <SubmitButton label="Move down" disabled={i === photos.length - 1}>
                    ↓
                  </SubmitButton>
                </form>
                <form action={deletePhoto}>
                  <input type="hidden" name="id" value={p.id} />
                  <SubmitButton
                    className="admin-btn admin-btn--danger"
                    confirm="Delete this photo permanently?"
                  >
                    Delete
                  </SubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
