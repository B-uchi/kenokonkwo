// Creates the tables and, on first run, imports the two original photos.
// Usage: npm run db:setup
import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";
import { AwsClient } from "aws4fetch";

nextEnv.loadEnvConfig(process.cwd());
const env = process.env;

const sql = neon(env.DATABASE_URL);

const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = schema
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) await sql.query(statement);
console.log(`✓ schema applied (${statements.length} statements)`);

const [{ count }] = await sql`select count(*)::int as count from photos`;
if (count > 0) {
  console.log(`✓ photos table already has ${count} rows — skipping seed`);
  process.exit(0);
}

const r2 = new AwsClient({
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  service: "s3",
  region: "auto",
});

const seed = [
  { file: "assets/ken-okonkwo.jpeg", key: "photos/seed-portrait.jpeg", type: "image/jpeg", width: 1684, height: 2528, caption: "Elder Chuka Ken Okonkwo" },
  { file: "assets/memorial-flyer.png", key: "photos/seed-flyer.png", type: "image/png", width: 1760, height: 2394, caption: "Celebration of a spectacular life" },
];

for (const [position, photo] of seed.entries()) {
  const body = await readFile(photo.file);
  const res = await r2.fetch(
    `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}/${photo.key}`,
    { method: "PUT", body, headers: { "content-type": photo.type } },
  );
  if (!res.ok) throw new Error(`upload ${photo.file} failed: ${res.status}`);
  await sql`
    insert into photos (key, width, height, caption, position)
    values (${photo.key}, ${photo.width}, ${photo.height}, ${photo.caption}, ${position})
    on conflict (key) do nothing`;
  console.log(`✓ seeded ${photo.key}`);
}
