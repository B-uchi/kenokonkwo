import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { getTributeCounts, getTributes } from "@/lib/server/tributes";
import type { TributeStatus } from "@/lib/types";
import { approveTribute, hideTribute, removeTribute } from "../../actions";
import SubmitButton from "../submit-button";

export const metadata: Metadata = {
  title: "Tributes",
};

// tributes publish immediately, so the live list is the useful default
const tabs: { status: TributeStatus; label: string; empty: string }[] = [
  { status: "approved", label: "On the site", empty: "No tributes yet." },
  { status: "hidden", label: "Hidden", empty: "Nothing hidden." },
  { status: "pending", label: "Pending", empty: "Nothing waiting for review." },
];

const formatDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/New_York",
});

export default async function AdminTributesPage({
  searchParams,
}: PageProps<"/admin/tributes">) {
  await requireAdmin();

  const { status: requested } = await searchParams;
  const tab = tabs.find((t) => t.status === requested) ?? tabs[0];
  const [tributes, counts] = await Promise.all([
    getTributes(tab.status),
    getTributeCounts(),
  ]);

  return (
    <>
      <div className="admin-title">
        <h1>Tributes</h1>
        <p>
          Tributes appear on the site as soon as they are posted. Hide anything
          that shouldn&rsquo;t be there.
        </p>
      </div>

      <nav className="admin-tabs" aria-label="Tribute status">
        {tabs.map((t) => (
          <Link
            key={t.status}
            href={`/admin/tributes?status=${t.status}`}
            aria-current={t.status === tab.status ? "page" : undefined}
          >
            {t.label}
            <span className="admin-count">{counts[t.status]}</span>
          </Link>
        ))}
      </nav>

      {tributes.length === 0 ? (
        <p className="admin-empty">{tab.empty}</p>
      ) : (
        <ul className="admin-list">
          {tributes.map((t) => (
            <li key={t.id} className="admin-card">
              <div className="admin-card-meta">
                <strong>{t.name}</strong>
                <span>{t.relation}</span>
                <time dateTime={t.createdAt}>
                  {formatDate.format(new Date(t.createdAt))}
                </time>
              </div>
              <p className="admin-message">{t.message}</p>
              <div className="admin-actions">
                {t.status !== "approved" && (
                  <form action={approveTribute}>
                    <input type="hidden" name="id" value={t.id} />
                    <SubmitButton className="admin-btn admin-btn--primary">
                      {t.status === "hidden" ? "Restore & approve" : "Approve"}
                    </SubmitButton>
                  </form>
                )}
                {t.status !== "hidden" && (
                  <form action={hideTribute}>
                    <input type="hidden" name="id" value={t.id} />
                    <SubmitButton>
                      {t.status === "approved" ? "Remove from site" : "Hide"}
                    </SubmitButton>
                  </form>
                )}
                {t.status === "hidden" && (
                  <form action={removeTribute}>
                    <input type="hidden" name="id" value={t.id} />
                    <SubmitButton
                      className="admin-btn admin-btn--danger"
                      confirm="Delete this tribute permanently?"
                    >
                      Delete permanently
                    </SubmitButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
