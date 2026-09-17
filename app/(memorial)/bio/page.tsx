import type { Metadata } from "next";
import Link from "next/link";
import { getBiography } from "@/lib/server/biography";
import { isEmptyDoc } from "@/lib/rich-text";
import { RichText } from "@/lib/rich-text-view";

export const metadata: Metadata = {
  title: "Biography",
};

export default async function BiographyPage() {
  const { title, body } = await getBiography();

  return (
    <article className="bio">
      <header style={{ textAlign: "center" }}>
        <p className="eyebrow">Biography</p>
        <h1 className="page-title">{title || "A life of service"}</h1>
        <p className="bio-dates">
          3 SEPTEMBER 1949 &nbsp;&ndash;&nbsp; 10 SEPTEMBER 2026
        </p>
        <div className="gold-rule bio-rule" />
      </header>

      {isEmptyDoc(body) ? (
        <p className="bio-lead">His story will be shared here soon.</p>
      ) : (
        <div className="bio-content">
          <RichText doc={body} />
        </div>
      )}

      <div className="bio-links">
        <Link href="/tributes" className="btn-outline">
          Read tributes
        </Link>
        <Link href="/photos" className="btn-outline">
          View photographs
        </Link>
      </div>
    </article>
  );
}
