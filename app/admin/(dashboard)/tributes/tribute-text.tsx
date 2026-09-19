"use client";

import { useEffect, useRef, useState } from "react";

/** Same clamped message + toggle as the public tribute cards. */
export default function TributeText({ message }: { message: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clipped, setClipped] = useState(false);

  useEffect(() => {
    if (expanded) return;
    const measure = () => {
      const el = ref.current;
      if (el) setClipped(el.scrollHeight > el.clientHeight + 2);
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, [expanded]);

  return (
    <>
      <p
        ref={ref}
        className={expanded ? "admin-message" : "admin-message is-clamped"}
      >
        {message}
      </p>
      {/* always rendered, so cards without a toggle are no shorter */}
      <button
        type="button"
        className={clipped || expanded ? "tribute-more" : "tribute-more is-hidden"}
        onClick={() => setExpanded((v) => !v)}
        aria-hidden={!clipped && !expanded}
        tabIndex={clipped || expanded ? undefined : -1}
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </>
  );
}
