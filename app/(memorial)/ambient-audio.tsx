"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AMBIENT_PLAY_EVENT } from "@/lib/ambient";

const TRACKS = ["bg-a", "bg-b", "bg-c", "bg-d"];
const GAP_MS = 2000; // quiet pause between tracks (each already fades out)
const VOLUME = 0.35;
const FADE_MS = 1200;
const STORAGE_KEY = "memorial-sound";

/** Opus is far smaller; MP3 is the fallback for browsers without it. */
const trackUrl = (audio: HTMLAudioElement, index: number) => {
  const opus = audio.canPlayType('audio/webm; codecs="opus"') !== "";
  return `/audio/${TRACKS[index]}.${opus ? "webm" : "mp3"}`;
};

const remember = (value: "on" | "off") => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // private mode — the choice just won't persist
  }
};

const mutedByChoice = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "off";
  } catch {
    return false;
  }
};

export default function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const track = useRef(0);
  const gapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fadeTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const [playing, setPlaying] = useState(false);

  /** ease the volume up so the first note isn't abrupt */
  const fadeIn = useCallback((audio: HTMLAudioElement) => {
    clearInterval(fadeTimer.current);
    audio.volume = 0;
    const step = 50;
    let elapsed = 0;
    fadeTimer.current = setInterval(() => {
      elapsed += step;
      audio.volume = Math.min(VOLUME, (elapsed / FADE_MS) * VOLUME);
      if (elapsed >= FADE_MS) clearInterval(fadeTimer.current);
    }, step);
  }, []);

  const start = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;
    if (!audio.src) audio.src = trackUrl(audio, track.current);
    try {
      fadeIn(audio);
      await audio.play();
      setPlaying(true);
      return true;
    } catch {
      return false; // browser blocked it — needs a click first
    }
  }, [fadeIn]);

  // try to start on arrival; if the browser blocks it, wait for a first click
  useEffect(() => {
    let cancelled = false;
    const onGesture = () => {
      if (!cancelled && !mutedByChoice()) void start();
    };

    void (async () => {
      if (mutedByChoice() || cancelled) return;
      const ok = await start();
      if (!ok && !cancelled) {
        window.addEventListener("pointerdown", onGesture, { once: true });
        window.addEventListener("keydown", onGesture, { once: true });
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      clearTimeout(gapTimer.current);
      clearInterval(fadeTimer.current);
    };
  }, [start]);

  // the menu cards and slideshow ask for music on click; they start it either way
  useEffect(() => {
    const onRequest = () => {
      const audio = audioRef.current;
      if (!audio || !audio.paused) return;
      void start().then((ok) => ok && remember("on"));
    };
    window.addEventListener(AMBIENT_PLAY_EVENT, onRequest);
    return () => window.removeEventListener(AMBIENT_PLAY_EVENT, onRequest);
  }, [start]);

  function playNext() {
    const audio = audioRef.current;
    if (!audio) return;
    track.current = (track.current + 1) % TRACKS.length;
    audio.src = trackUrl(audio, track.current);
    void start();
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      clearTimeout(gapTimer.current);
      clearInterval(fadeTimer.current);
      audio.pause();
      setPlaying(false);
      remember("off");
    } else {
      void start().then((ok) => ok && remember("on"));
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        onEnded={() => {
          // short silence, then the next track
          clearTimeout(gapTimer.current);
          gapTimer.current = setTimeout(playNext, GAP_MS);
        }}
      />
      <button
        type="button"
        className="sound-btn"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Turn music off" : "Turn music on"}
        title={playing ? "Turn music off" : "Turn music on"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
          {playing ? (
            <>
              <path d="M15.6 9.2a4 4 0 0 1 0 5.6" />
              <path d="M18 6.8a7.4 7.4 0 0 1 0 10.4" />
            </>
          ) : (
            <path d="M16 9.8l4.5 4.4M20.5 9.8L16 14.2" />
          )}
        </svg>
      </button>
    </>
  );
}
