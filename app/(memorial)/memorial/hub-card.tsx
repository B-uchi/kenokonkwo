"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { requestAmbientPlay } from "@/lib/ambient";

/** Menu card that also starts the music — the click is the browser's cue that sound is welcome. */
export default function HubCard({
  href,
  style,
  children,
}: {
  href: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="hub-card" style={style} onClick={requestAmbientPlay}>
      {children}
    </Link>
  );
}
