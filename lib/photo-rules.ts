/** Shared by the uploader (client) and the upload actions (server). */
export const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MAX_PHOTO_MB = 25;
export const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;
