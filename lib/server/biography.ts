import "server-only";
import { EMPTY_DOC, sanitizeDoc, type RichTextDoc } from "@/lib/rich-text";
import { sql } from "./db";

export async function getBiography(): Promise<{
  title: string;
  body: RichTextDoc;
}> {
  const [row] = (await sql`select title, body from biography where id = 1`) as {
    title: string;
    body: unknown;
  }[];
  return {
    title: row?.title ?? "",
    // sanitize on read too, in case the row was edited outside the app
    body: row ? sanitizeDoc(row.body) : EMPTY_DOC,
  };
}

export async function saveBiography(title: string, body: RichTextDoc) {
  await sql`
    update biography
    set title = ${title}, body = ${JSON.stringify(body)}::jsonb, updated_at = now()
    where id = 1`;
}
