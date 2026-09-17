import "server-only";
import type { Photo } from "@/lib/types";
import { sql } from "./db";
import { publicUrl } from "./r2";

type Row = {
  id: string;
  key: string;
  width: number;
  height: number;
  caption: string;
};

export async function getPhotos(): Promise<(Photo & { key: string })[]> {
  const rows = (await sql`
    select id, key, width, height, caption
    from photos
    order by position, created_at`) as Row[];
  return rows.map((r) => ({ ...r, url: publicUrl(r.key) }));
}

export async function getPhotoKey(id: string) {
  const [row] = (await sql`select key from photos where id = ${id}`) as { key: string }[];
  return row?.key ?? null;
}

export async function insertPhoto(input: {
  key: string;
  width: number;
  height: number;
  caption: string;
}) {
  await sql`
    insert into photos (key, width, height, caption, position)
    values (
      ${input.key}, ${input.width}, ${input.height}, ${input.caption},
      (select coalesce(max(position), -1) + 1 from photos)
    )`;
}

export async function updateCaption(id: string, caption: string) {
  await sql`update photos set caption = ${caption} where id = ${id}`;
}

/** Swap a photo with its neighbour above (-1) or below (+1). */
export async function movePhoto(id: string, direction: -1 | 1) {
  const ids = ((await sql`select id from photos order by position, created_at`) as { id: string }[]).map(
    (r) => r.id,
  );
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  // rewrite positions so ordering stays dense and deterministic
  await sql.transaction(
    ids.map((photoId, position) => sql`update photos set position = ${position} where id = ${photoId}`),
  );
}

export async function deletePhotoRow(id: string) {
  await sql`delete from photos where id = ${id}`;
}
