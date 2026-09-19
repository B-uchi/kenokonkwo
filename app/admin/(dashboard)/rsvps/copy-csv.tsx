"use client";

import { useState } from "react";
import { rsvpCsv } from "../../actions";

export default function CopyCsv() {
  const [label, setLabel] = useState("Copy as CSV");

  /** older browsers, and any case where the clipboard API refuses */
  function copyFallback(text: string) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }

  async function copy() {
    setLabel("Copying…");
    try {
      const csv = await rsvpCsv();
      try {
        await navigator.clipboard.writeText(csv);
      } catch {
        if (!copyFallback(csv)) throw new Error("copy refused");
      }
      setLabel("Copied");
    } catch {
      setLabel("Could not copy");
    }
    setTimeout(() => setLabel("Copy as CSV"), 2500);
  }

  return (
    <button type="button" className="admin-btn" onClick={copy}>
      {label}
    </button>
  );
}
