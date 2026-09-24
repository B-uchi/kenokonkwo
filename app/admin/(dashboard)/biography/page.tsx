import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/auth";
import { getBiography } from "@/lib/server/biography";
import BiographyEditor from "./biography-editor";

export const metadata: Metadata = {
  title: "Biography",
};

export default async function AdminBiographyPage() {
  await requireAdmin();
  const { main, second } = await getBiography();

  return (
    <>
      <div className="admin-title">
        <h1>Biography</h1>
        <p>
          The story shown on the Biography page. The second account appears
          below the family&rsquo;s, once you switch it on.
        </p>
      </div>

      <BiographyEditor main={main} second={second} />
    </>
  );
}
