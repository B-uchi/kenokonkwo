import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/auth";
import { getBiography } from "@/lib/server/biography";
import BiographyEditor from "./biography-editor";

export const metadata: Metadata = {
  title: "Biography",
};

export default async function AdminBiographyPage() {
  await requireAdmin();
  const { title, body } = await getBiography();

  return (
    <>
      <div className="admin-title">
        <h1>Biography</h1>
        <p>
          The title and story shown on the Biography page. Formatting uses the
          site&rsquo;s own fonts and colours.
        </p>
      </div>

      <BiographyEditor title={title} body={body} />
    </>
  );
}
