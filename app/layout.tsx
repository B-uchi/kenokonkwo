import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Mulish, Parisienne } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: "400",
});

const title = "In Loving Memory · Elder Chuka Ken Okonkwo";
const description =
  "Celebrating the life of Elder Chuka Ken Okonkwo (Captain Ken), September 3, 1949 – September 10, 2026. An exceptional man who walked with God, led with love and touched countless lives.";

export const metadata: Metadata = {
  // Social previews need absolute image URLs — set NEXT_PUBLIC_SITE_URL to the live domain
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: title,
    template: "%s · Elder Chuka Ken Okonkwo",
  },
  description,
  openGraph: {
    title,
    description,
    siteName: "Elder Chuka Ken Okonkwo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F0E5",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${mulish.variable} ${parisienne.variable}`}
    >
      <body>
        <div className="site">{children}</div>
      </body>
    </html>
  );
}
