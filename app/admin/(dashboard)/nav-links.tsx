"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/tributes", label: "Tributes" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/biography", label: "Biography" },
  { href: "/admin/rsvps", label: "RSVPs" },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="Admin">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={pathname.startsWith(l.href) ? "page" : undefined}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
