import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Memorial",
};

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#A97C31",
  strokeWidth: 1.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const sections = [
  {
    href: "/tributes",
    title: "Tributes",
    description:
      "Leave a message for the family, and read what others have shared.",
    meta: "0 shared",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="4.5" width="18" height="12.5" rx="4" />
        <path d="M8.5 17 L8 20.5 L12 17" />
      </svg>
    ),
  },
  {
    href: "/bio",
    title: "Biography",
    description:
      "The story of a life — family, faith, work and the years between.",
    meta: "1949 – 2026",
    icon: (
      <svg {...iconProps}>
        <path d="M12 6.5 C10 4.8 6.8 4.6 4 5.2 V18.4 C6.8 17.8 10 18 12 19.6" />
        <path d="M12 6.5 C14 4.8 17.2 4.6 20 5.2 V18.4 C17.2 17.8 14 18 12 19.6" />
        <path d="M12 6.5 V19.6" />
      </svg>
    ),
  },
  {
    href: "/photos",
    title: "Photographs",
    description: "Moments kept by the people who loved him.",
    meta: "Gallery",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="14" rx="3.5" />
        <circle cx="8.5" cy="10" r="1.6" />
        <path d="M3.6 17.5 L9.5 12.4 L14 16 L17 13.6 L20.4 16.6" />
      </svg>
    ),
  },
  {
    href: "/venues",
    title: "Service & Venues",
    description: "Dates, times and directions for both services.",
    meta: "USA & Nigeria",
    icon: (
      <svg {...iconProps}>
        <path d="M12 21 C12 21 18.5 15.4 18.5 10.5 A6.5 6.5 0 0 0 5.5 10.5 C5.5 15.4 12 21 12 21 Z" />
        <circle cx="12" cy="10.3" r="2.4" />
      </svg>
    ),
  },
];

export default function HubPage() {
  return (
    <div className="hub">
      <div className="hub-head">
        <p className="eyebrow">Celebration of a Spectacular Life</p>
        <h1>Where would you like to begin?</h1>
      </div>

      <nav className="hub-grid" aria-label="Memorial sections">
        {sections.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            className="hub-card"
            style={{ animationDelay: `${60 + i * 80}ms` }}
          >
            <span className="hub-icon">{s.icon}</span>
            <span>
              <span className="hub-card-title">{s.title}</span>
              <span className="hub-card-desc">{s.description}</span>
            </span>
            <span className="hub-card-meta">{s.meta}</span>
          </Link>
        ))}
      </nav>

      <p className="hub-thanks">
        Thank you for standing with the Okonkwo family during this time.
      </p>
    </div>
  );
}
