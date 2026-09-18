"use client";

import { useEffect, useRef, useState } from "react";

const MEDIA_ERRORS: Record<number, string> = {
  1: "aborted",
  2: "network error",
  3: "could not decode",
  4: "format not supported",
};

function collectFacts(): [string, string][] {
  const a = new Audio();
  a.volume = 0.3;
  return [
    ["Browser", navigator.userAgent],
    ["WebM / Opus", a.canPlayType('audio/webm; codecs="opus"') || "no"],
    ["MP3", a.canPlayType("audio/mpeg") || "no"],
    ["Volume can be set", a.volume === 0.3 ? "yes" : "no (iPhone behaviour)"],
    [
      "Site would use",
      a.canPlayType('audio/webm; codecs="opus"') === "probably"
        ? "bg-a.webm"
        : "bg-a.mp3",
    ],
  ];
}

export default function SoundCheck() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [facts, setFacts] = useState<[string, string][]>([]);
  const [result, setResult] = useState("Tap a button below to test.");

  useEffect(() => {
    // after paint, so this never runs during hydration
    const id = requestAnimationFrame(() => setFacts(collectFacts()));
    return () => cancelAnimationFrame(id);
  }, []);

  async function test(file: string) {
    const audio = audioRef.current;
    if (!audio) return;
    setResult(`Loading ${file}…`);
    audio.src = `/audio/${file}`;
    try {
      await audio.play();
      setTimeout(() => {
        const moving = audio.currentTime > 0.2;
        setResult(
          moving
            ? `Playing ${file} (${audio.currentTime.toFixed(1)}s). If you hear nothing, check the silent switch on the side of the phone and the volume buttons.`
            : `${file} started but the timer is stuck at ${audio.currentTime.toFixed(2)}s.`,
        );
      }, 1500);
    } catch (error) {
      const code = audio.error?.code;
      setResult(
        `${file} failed: ${error instanceof Error ? error.name : "error"}${
          code ? ` — ${MEDIA_ERRORS[code] ?? code}` : ""
        }`,
      );
    }
  }

  return (
    <main className="bio" style={{ paddingTop: 40 }}>
      <h1 className="page-title">Sound check</h1>
      <p className="bio-lead">
        Tap each button, then send a screenshot of this page.
      </p>

      <div className="bio-links" style={{ marginTop: 24 }}>
        <button type="button" className="btn-gold" onClick={() => test("bg-a.mp3")}>
          Test MP3
        </button>
        <button type="button" className="btn-outline" onClick={() => test("bg-a.webm")}>
          Test WebM
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => audioRef.current?.pause()}
        >
          Stop
        </button>
      </div>

      <p className="form-error" style={{ background: "rgba(180,137,60,.1)", color: "var(--ink)" }}>
        {result}
      </p>

      <dl className="bio-content" style={{ fontSize: 14 }}>
        {facts.map(([label, value]) => (
          <div key={label} style={{ marginTop: 12 }}>
            <dt style={{ fontWeight: 600 }}>{label}</dt>
            <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{value}</dd>
          </div>
        ))}
      </dl>

      <audio ref={audioRef} preload="auto" />
    </main>
  );
}
