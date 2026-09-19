import type { Metadata } from "next";
import Image from "next/image";
import { requireAdmin } from "@/lib/server/auth";
import {
  countPhotos,
  getPhotosPage,
  PHOTOS_PER_PAGE,
} from "@/lib/server/photos";
import {
  deletePhoto,
  movePhotoDown,
  movePhotoUp,
  saveCaption,
} from "../../actions";
import SubmitButton from "../submit-button";
import PhotoUploader from "./photo-uploader";
import Pager from "../pager";

export const metadata: Metadata = {
  title: "Photos",
};

export default async function AdminPhotosPage({
  searchParams,
}: PageProps<"/admin/photos">) {
  await requireAdmin();
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number(rawPage) || 1);
  const [total, photos] = await Promise.all([
    countPhotos(),
    getPhotosPage(page),
  ]);
  const pages = Math.max(1, Math.ceil(total / PHOTOS_PER_PAGE));
  const offset = (page - 1) * PHOTOS_PER_PAGE;

  return (
    <>
      <div className="admin-title">
        <h1>Photos</h1>
        <p>
          {total} {total === 1 ? "photo" : "photos"} in the gallery. The order
          here is the order visitors see.
        </p>
      </div>

      <PhotoUploader />

      {photos.length === 0 ? (
        <p className="admin-empty">No photos yet — add some above.</p>
      ) : (
        <>
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
                  <SubmitButton label="Move up" disabled={offset + i === 0}>
                    ↑
                  </SubmitButton>
                </form>
                <form action={movePhotoDown}>
                  <input type="hidden" name="id" value={p.id} />
                  <SubmitButton label="Move down" disabled={offset + i === total - 1}>
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
          <Pager page={page} pages={pages} href={(n) => `/admin/photos?page=${n}`} />
        </>
      )}
    </>
  );
}
