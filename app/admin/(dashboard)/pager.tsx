import Link from "next/link";

/** Shared pager for the admin lists. */
export default function Pager({
  page,
  pages,
  href,
}: {
  page: number;
  pages: number;
  href: (page: number) => string;
}) {
  if (pages <= 1) return null;
  return (
    <nav className="admin-pager" aria-label="Pages">
      {page > 1 && (
        <Link className="admin-btn" href={href(page - 1)}>
          ← Previous
        </Link>
      )}
      <span>
        Page {page} of {pages}
      </span>
      {page < pages && (
        <Link className="admin-btn" href={href(page + 1)}>
          Next →
        </Link>
      )}
    </nav>
  );
}
