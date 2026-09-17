import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { logout } from "../actions";
import NavLinks from "./nav-links";

export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <>
      <header className="admin-header">
        <Link href="/admin/tributes" className="admin-brand">
          Memorial admin
        </Link>
        <NavLinks />
        <div className="admin-header-end">
          <Link href="/memorial" target="_blank" className="admin-link">
            View site
          </Link>
          <form action={logout}>
            <button type="submit" className="admin-link">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </>
  );
}
