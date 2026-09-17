"use client";

import Image, { getImageProps } from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import type { Photo } from "@/lib/types";
import { preloadImage } from "./preload";

/** one size for wide + fullscreen so both share a single download per photo */
const VIEW_SIZES = "100vw";
const TILE_SIZES = "(max-width: 560px) 50vw, 260px";
const SLIDE_MS = 5000;
const IDLE_MS = 2600;
const DEFAULT_ALT = "Photograph of Elder Chuka Ken Okonkwo";

type Item = Photo & {
  alt: string;
  img: ReturnType<typeof getImageProps>["props"];
};
type View = "grid" | "wide";
type Pos = { index: number; prev: number };

const wrap = (i: number, n: number) => ((i % n) + n) % n;

/** signed shortest distance from `from` to `i` around a loop of n */
function loopOffset(i: number, from: number, n: number) {
  let d = wrap(i - from, n);
  if (d > n / 2) d -= n;
  return d;
}

/**
 * Preload + decode photos nearest the current one first (3 at a time).
 * Returns the set of ids that are ready to display.
 */
function usePreloaded(items: Item[], enabled: boolean, from: number) {
  const [ready, setReady] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const n = items.length;
    if (!enabled || n === 0) return;
    let alive = true;
    const order = items
      .map((_, i) => i)
      .sort(
        (a, b) =>
          Math.abs(loopOffset(a, from, n)) - Math.abs(loopOffset(b, from, n)),
      );
    let cursor = 0;
    const worker = async () => {
      while (alive && cursor < order.length) {
        const item = items[order[cursor++]];
        await preloadImage(item.img);
        if (alive)
          setReady((r) => (r.has(item.id) ? r : new Set(r).add(item.id)));
      }
    };
    for (let k = 0; k < 3; k++) void worker();
    return () => {
      alive = false;
    };
  }, [items, enabled, from]);

  return ready;
}

export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const items = useMemo<Item[]>(
    () =>
      photos.map((p) => {
        const alt = p.caption || DEFAULT_ALT;
        return {
          ...p,
          alt,
          img: getImageProps({
            src: p.url,
            width: p.width,
            height: p.height,
            alt,
            sizes: VIEW_SIZES,
            loading: "eager",
          }).props,
        };
      }),
    [photos],
  );
  const n = items.length;

  const [view, setView] = useState<View>("grid");
  const [pos, setPos] = useState<Pos>({ index: 0, prev: 0 });
  const [playerOpen, setPlayerOpen] = useState(false);
  const [warm, setWarm] = useState(false);

  const ready = usePreloaded(
    items,
    warm || view === "wide" || playerOpen,
    pos.index,
  );

  const step = useCallback(
    (d: number) =>
      setPos((p) => ({ index: wrap(p.index + d, n), prev: p.index })),
    [n],
  );
  const goTo = useCallback(
    (i: number) => setPos((p) => ({ index: wrap(i, n), prev: p.index })),
    [n],
  );

  function openPlayer() {
    // must be requested inside the click for browsers to allow it
    document.documentElement.requestFullscreen?.().catch(() => {});
    setPlayerOpen(true);
  }

  const closePlayer = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setPlayerOpen(false);
  }, []);

  const warmUp = () => setWarm(true);

  const barRef = useRef<HTMLDivElement>(null);
  function showWide(i?: number) {
    if (i !== undefined) goTo(i);
    setView("wide");
    // bring toolbar + stage into view so the wide view fills the screen
    requestAnimationFrame(() =>
      barRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <>
      {n > 0 && (
        <div ref={barRef} className="gallery-bar">
          <div className="view-toggle" role="group" aria-label="Gallery view">
            <button
              type="button"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.4" />
                <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.4" />
                <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.4" />
                <rect x="9" y="9" width="5.5" height="5.5" rx="1.4" />
              </svg>
              Grid
            </button>
            <button
              type="button"
              aria-pressed={view === "wide"}
              onClick={() => showWide()}
              onPointerEnter={warmUp}
              onFocus={warmUp}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="4" y="2.5" width="8" height="11" rx="1.4" />
                <path d="M2 4.5 V11.5 M14 4.5 V11.5" />
              </svg>
              Wide
            </button>
          </div>

          <button
            type="button"
            className="btn-gold play-btn"
            onClick={openPlayer}
            onPointerEnter={warmUp}
            onFocus={warmUp}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M3 1.8 L10.2 6 L3 10.2 Z" fill="currentColor" />
            </svg>
            Play slideshow
          </button>
        </div>
      )}

      {view === "grid" || n === 0 ? (
        <div className="photo-grid">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              className="photo"
              aria-label={`View ${it.alt}`}
              onClick={() => showWide(i)}
            >
              <Image src={it.url} alt="" fill sizes={TILE_SIZES} />
            </button>
          ))}
        </div>
      ) : (
        <FlipBook
          items={items}
          pos={pos}
          ready={ready}
          step={step}
          keyboard={!playerOpen}
        />
      )}

      {playerOpen && (
        <Player
          items={items}
          index={pos.index}
          ready={ready}
          step={step}
          onClose={closePlayer}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* wide view: centred photo, neighbours angled away like book pages   */
/* ------------------------------------------------------------------ */

function FlipBook({
  items,
  pos,
  ready,
  step,
  keyboard,
}: {
  items: Item[];
  pos: Pos;
  ready: ReadonlySet<string>;
  step: (d: number) => void;
  keyboard: boolean;
}) {
  const n = items.length;
  const { index, prev } = pos;
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);

  useEffect(() => {
    if (!keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keyboard, step]);

  function onPointerDown(e: PointerEvent) {
    startX.current = e.clientX;
    swiped.current = false;
  }
  function onPointerUp(e: PointerEvent) {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 40) {
      swiped.current = true;
      step(dx < 0 ? 1 : -1);
    }
  }

  const current = items[index];

  return (
    <section className="flip" aria-roledescription="carousel" aria-label="Photographs">
      <div
        className="flip-stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (startX.current = null)}
      >
        {items.map((it, i) => {
          const off = loopOffset(i, index, n);
          const was = loopOffset(i, prev, n);
          const dist = Math.abs(off);
          const side = Math.max(-1, Math.min(1, off));
          const style = {
            "--x": Math.max(-2, Math.min(2, off)),
            "--r": `${-side * 38}deg`,
            "--s": dist === 0 ? 1 : 0.84,
            "--o": dist === 0 ? 1 : dist === 1 ? 0.42 : 0,
            zIndex: 10 - dist,
          } as CSSProperties;
          const className = [
            "flip-page",
            dist === 0 && "is-current",
            dist > 1 && "is-hidden",
            // wrapped from one side to the other: move without animating
            Math.abs(off - was) > 1 && "is-jump",
            ready.has(it.id) && "is-ready",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div
              key={it.id}
              className={className}
              style={style}
              aria-hidden={dist !== 0}
              onClick={
                dist === 1
                  ? () => {
                      if (!swiped.current) step(off);
                    }
                  : undefined
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- same srcset as the photo, so no extra download */}
              <img {...it.img} alt="" aria-hidden="true" draggable={false} className="page-backdrop" style={undefined} />
              {/* eslint-disable-next-line @next/next/no-img-element -- props come from getImageProps */}
              <img
                {...it.img}
                alt={dist === 0 ? it.alt : ""}
                draggable={false}
                className="page-img"
                style={undefined}
              />
              <span className="spinner" aria-hidden="true" />
            </div>
          );
        })}

        {n > 1 && (
          <>
            <button
              type="button"
              className="flip-arrow flip-arrow--prev"
              onClick={() => step(-1)}
              aria-label="Previous photo"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              className="flip-arrow flip-arrow--next"
              onClick={() => step(1)}
              aria-label="Next photo"
            >
              <Chevron dir="right" />
            </button>
          </>
        )}
      </div>

      <div className="flip-caption" aria-live="polite">
        <span>{current.alt}</span>
        <span className="flip-count">
          {index + 1} / {n}
        </span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* fullscreen slideshow                                               */
/* ------------------------------------------------------------------ */

function Player({
  items,
  index,
  ready,
  step,
  onClose,
}: {
  items: Item[];
  index: number;
  ready: ReadonlySet<string>;
  step: (d: number) => void;
  onClose: () => void;
}) {
  const n = items.length;
  const [playing, setPlaying] = useState(true);
  const [waiting, setWaiting] = useState(false);
  const [idle, setIdle] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const navToken = useRef(0);

  const current = items[index];
  const currentReady = ready.has(current.id);
  const running = playing && currentReady && !waiting;

  const wake = useCallback(() => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
  }, []);

  const manualStep = useCallback(
    (d: number) => {
      navToken.current++;
      setWaiting(false);
      step(d);
      wake();
    },
    [step, wake],
  );

  // progress bar finished: move on once the next photo is decoded
  function advance() {
    if (n < 2) return;
    const token = ++navToken.current;
    const next = items[wrap(index + 1, n)];
    if (ready.has(next.id)) {
      step(1);
      return;
    }
    setWaiting(true);
    preloadImage(next.img).then(() => {
      if (navToken.current !== token) return;
      setWaiting(false);
      step(1);
    });
  }

  useEffect(() => {
    idleTimer.current = setTimeout(() => setIdle(true), IDLE_MS);
    return () => clearTimeout(idleTimer.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") manualStep(-1);
      else if (e.key === "ArrowRight") manualStep(1);
      else if (e.key === " " || e.key === "k") {
        e.preventDefault();
        setPlaying((p) => !p);
        wake();
      }
    };
    // leaving browser fullscreen (Esc is swallowed by the browser) closes the player
    const onFullscreen = () => {
      if (!document.fullscreenElement) onClose();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [onClose, manualStep, wake]);

  return (
    <div
      className={idle ? "player is-idle" : "player"}
      role="dialog"
      aria-modal="true"
      aria-label="Photo slideshow"
      style={{ "--slide-ms": `${SLIDE_MS}ms` } as CSSProperties}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") wake();
      }}
      onPointerDown={(e) => {
        const onControl = (e.target as HTMLElement).closest("button");
        if (e.pointerType !== "mouse" && !onControl && !idle) {
          clearTimeout(idleTimer.current);
          setIdle(true);
        } else {
          wake();
        }
      }}
    >
      <div className="player-stage">
        {items.map((it, i) => {
          const off = loopOffset(i, index, n);
          if (Math.abs(off) > 1) return null;
          const on = off === 0;
          const className = [
            "player-slide",
            on && "is-on",
            ready.has(it.id) && "is-ready",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <div
              key={it.id}
              className={className}
              aria-hidden={!on}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- same srcset as the photo, so no extra download */}
              <img {...it.img} alt="" aria-hidden="true" draggable={false} className="player-backdrop" style={undefined} />
              {/* eslint-disable-next-line @next/next/no-img-element -- props come from getImageProps */}
              <img
                {...it.img}
                alt={on ? it.alt : ""}
                draggable={false}
                className="player-img"
                style={{ animationPlayState: running ? "running" : "paused" }}
              />
            </div>
          );
        })}
        {(!currentReady || waiting) && (
          <span className="spinner spinner--light" aria-label="Loading" />
        )}
      </div>

      <div className="player-progress" aria-hidden="true">
        <span
          key={index}
          style={{ animationPlayState: running ? "running" : "paused" }}
          onAnimationEnd={advance}
        />
      </div>

      <button
        type="button"
        className="player-close"
        onClick={onClose}
        aria-label="Close slideshow"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path
            d="M4 4 L14 14 M14 4 L4 14"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="player-bar">
        <p className="player-caption">
          <span>{current.alt}</span>
          <span>
            {index + 1} / {n}
          </span>
        </p>
        <div className="player-controls">
          <button
            type="button"
            onClick={() => manualStep(-1)}
            aria-label="Previous photo"
            disabled={n < 2}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            className="player-toggle"
            onClick={() => {
              setPlaying((p) => !p);
              wake();
            }}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="3.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
                <rect x="9.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4.5 2.4 L13 8 L4.5 13.6 Z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => manualStep(1)}
            aria-label="Next photo"
            disabled={n < 2}
          >
            <Chevron dir="right" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d={dir === "left" ? "M12.5 4 L6.5 10 L12.5 16" : "M7.5 4 L13.5 10 L7.5 16"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
