import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { getRsvpPage, getRsvpSummary, PER_PAGE } from "@/lib/server/rsvps";
import { removeRsvp } from "../../actions";
import SubmitButton from "../submit-button";
import CopyCsv from "./copy-csv";

export const metadata: Metadata = {
  title: "RSVPs",
};

const formatDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/New_York",
});

export default async function AdminRsvpsPage({
  searchParams,
}: PageProps<"/admin/rsvps">) {
  await requireAdmin();

  const { page: raw } = await searchParams;
  const page = Math.max(1, Number(raw) || 1);
  const [summary, rsvps] = await Promise.all([
    getRsvpSummary(),
    getRsvpPage(page),
  ]);
  const pages = Math.max(1, Math.ceil(summary.replies / PER_PAGE));

  return (
    <>
      <div className="admin-title">
        <h1>RSVPs</h1>
        <p>Who has said they are coming. Only you can see this.</p>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <strong>{summary.replies}</strong>
          <span>{summary.replies === 1 ? "reply" : "replies"}</span>
        </div>
        <div className="admin-stat">
          <strong>{summary.guests}</strong>
          <span>people expected</span>
        </div>
        <CopyCsv />
      </div>

      {rsvps.length === 0 ? (
        <p className="admin-empty">No RSVPs yet.</p>
      ) : (
        <>
          <ul className="admin-list">
            {rsvps.map((r) => (
              <li key={r.id} className="admin-card admin-rsvp">
                <div className="admin-rsvp-main">
                  <strong>{r.name}</strong>
                  <span className="admin-rsvp-guests">
                    {r.guests} {r.guests === 1 ? "person" : "people"}
                  </span>
                </div>
                <div className="admin-rsvp-contact">
                  <a href={`tel:${r.phone.replace(/\s+/g, "")}`}>{r.phone}</a>
                  {r.email && <a href={`mailto:${r.email}`}>{r.email}</a>}
                </div>
                <time dateTime={r.createdAt}>
                  {formatDate.format(new Date(r.createdAt))}
                </time>
                <form action={removeRsvp}>
                  <input type="hidden" name="id" value={r.id} />
                  <SubmitButton
                    className="admin-btn admin-btn--danger"
                    confirm="Delete this RSVP?"
                  >
                    Delete
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>

          {pages > 1 && (
            <nav className="admin-pager" aria-label="Pages">
              {page > 1 && (
                <Link
                  className="admin-btn"
                  href={`/admin/rsvps?page=${page - 1}`}
                >
                  ← Newer
                </Link>
              )}
              <span>
                Page {page} of {pages}
              </span>
              {page < pages && (
                <Link
                  className="admin-btn"
                  href={`/admin/rsvps?page=${page + 1}`}
                >
                  Older →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </>
  );
}
