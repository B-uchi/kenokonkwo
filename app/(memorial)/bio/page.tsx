import type { Metadata } from "next";
import Link from "next/link";
import { getBiography } from "@/lib/server/biography";
import { isEmptyDoc, type RichTextDoc } from "@/lib/rich-text";
import { RichText } from "@/lib/rich-text-view";

export const metadata: Metadata = {
  title: "Biography",
};

export default async function BiographyPage() {
  const { main, second } = await getBiography();
  const showSecond = second.visible && !isEmptyDoc(second.body);

  return (
    <article className="bio">
      <header style={{ textAlign: "center" }}>
        <p className="eyebrow">Biography</p>
        <h1 className="page-title">{main.title || "A life of service"}</h1>
        <p className="bio-dates">
          3 SEPTEMBER 1949 &nbsp;&ndash;&nbsp; 10 SEPTEMBER 2026
        </p>
        {main.author && <Byline author={main.author} />}
        <div className="gold-rule bio-rule" />

        {showSecond && (
          <nav className="bio-index" aria-label="On this page">
            <a href="#account-family">{main.title || "A life of service"}</a>
            <span aria-hidden="true">·</span>
            <a href="#account-second">{second.title || "A sister’s account"}</a>
          </nav>
        )}
      </header>

      <section id="account-family" aria-label={main.title || "Biography"}>
        <Account body={main.body} />
      </section>

      {showSecond && (
        <section className="bio-second" id="account-second">
          <div className="bio-second-rule" aria-hidden="true" />
          <header className="bio-second-head">
            <h2>{second.title}</h2>
            {second.author && <Byline author={second.author} />}
          </header>
          <Account body={second.body} />
        </section>
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

function Byline({ author }: { author: string }) {
  return (
    <p className="bio-byline">
      As remembered by <span>{author}</span>
    </p>
  );
}

function Account({ body }: { body: RichTextDoc }) {
  if (isEmptyDoc(body)) {
    return <p className="bio-lead">His story will be shared here soon.</p>;
  }
  return (
    <div className="bio-content">
      <RichText doc={body} />
    </div>
  );
}
