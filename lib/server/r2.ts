import "server-only";
import { AwsClient } from "aws4fetch";
import { env } from "./env";

const client = new AwsClient({
  accessKeyId: env("R2_ACCESS_KEY_ID"),
  secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
  service: "s3",
  region: "auto",
});

const objectUrl = (key: string) =>
  `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${env("R2_BUCKET")}/${key}`;

export const publicUrl = (key: string) =>
  `${env("R2_PUBLIC_URL").replace(/\/$/, "")}/${key}`;

/** Short-lived URL the browser can PUT a file to directly. */
export async function presignUpload(key: string, contentType: string) {
  const url = new URL(objectUrl(key));
  url.searchParams.set("X-Amz-Expires", "600");
  const signed = await client.sign(
    new Request(url, { method: "PUT", headers: { "content-type": contentType } }),
    { aws: { signQuery: true, allHeaders: true } },
  );
  return signed.url;
}

export async function headObject(key: string) {
  const res = await client.fetch(objectUrl(key), { method: "HEAD" });
  if (!res.ok) return null;
  return {
    size: Number(res.headers.get("content-length") ?? 0),
    contentType: res.headers.get("content-type") ?? "",
  };
}

export async function deleteObject(key: string) {
  const res = await client.fetch(objectUrl(key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    throw new Error(`R2 delete failed (${res.status})`);
  }
}
