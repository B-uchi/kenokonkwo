import "server-only";
import { EMPTY_DOC, sanitizeDoc, type RichTextDoc } from "@/lib/rich-text";
import { sql } from "./db";

export type BiographyAccount = {
  title: string;
  author: string;
  body: RichTextDoc;
};

export type Biography = {
  main: BiographyAccount;
  /** a second account — his sister's — shown below the family's */
  second: BiographyAccount & { visible: boolean };
};

type Row = {
  title: string;
  author: string;
  body: unknown;
  second_title: string;
  second_author: string;
  second_body: unknown;
  second_visible: boolean;
};

export async function getBiography(): Promise<Biography> {
  const [row] = (await sql`
    select title, author, body,
           second_title, second_author, second_body, second_visible
    from biography where id = 1`) as Row[];

  return {
    main: {
      title: row?.title ?? "",
      author: row?.author ?? "",
      // sanitize on read too, in case a row was edited outside the app
      body: row ? sanitizeDoc(row.body) : EMPTY_DOC,
    },
    second: {
      title: row?.second_title ?? "",
      author: row?.second_author ?? "",
      body: row ? sanitizeDoc(row.second_body) : EMPTY_DOC,
      visible: row?.second_visible ?? false,
    },
  };
}

export async function saveBiography(input: {
  main: BiographyAccount;
  second: BiographyAccount & { visible: boolean };
}) {
  await sql`
    update biography set
      title = ${input.main.title},
      author = ${input.main.author},
      body = ${JSON.stringify(input.main.body)}::jsonb,
      second_title = ${input.second.title},
      second_author = ${input.second.author},
      second_body = ${JSON.stringify(input.second.body)}::jsonb,
      second_visible = ${input.second.visible},
      updated_at = now()
    where id = 1`;
}
