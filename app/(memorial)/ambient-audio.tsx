"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AMBIENT_PLAY_EVENT } from "@/lib/ambient";

const TRACKS = ["bg-a", "bg-b", "bg-c", "bg-d"];
const GAP_MS = 2000; // quiet pause between tracks (each already fades out)
const VOLUME = 0.35;
const FADE_MS = 1200;
const STORAGE_KEY = "memorial-sound";
const POSITION_KEY = "memorial-sound-position";

/** AAC in an .m4a: the one format every target browser actually plays. */
const trackUrl = (index: number) => `/audio/${TRACKS[index]}.m4a`;

const remember = (value: "on" | "off") => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // private mode — the choice just won't persist
  }
};

/** Remember where we are so a page refresh picks the music back up. */
const savePosition = (index: number, seconds: number) => {
  try {
    sessionStorage.setItem(POSITION_KEY, JSON.stringify({ index, seconds }));
  } catch {
    // ignore — resuming is a nicety
  }
};

const loadPosition = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(POSITION_KEY) ?? "");
    const index = Number(saved?.index);
    const seconds = Number(saved?.seconds);
    if (Number.isInteger(index) && index >= 0 && index < TRACKS.length && seconds >= 0) {
      return { index, seconds };
    }
  } catch {
    // no usable position
  }
  return null;
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
  const resumeAt = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [waitingForClick, setWaitingForClick] = useState(false);

  /** ease the volume up so the first note isn't abrupt */
  const fadeIn = useCallback((audio: HTMLAudioElement) => {
    clearInterval(fadeTimer.current);
    audio.volume = 0;
    // iOS ignores volume changes (the hardware buttons own it) — play as-is
    if (audio.volume !== 0) return;
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
    if (!audio.src) audio.src = trackUrl(track.current);

    // pick the track back up where the last page left it
    const seekTo = resumeAt.current;
    resumeAt.current = 0;
    if (seekTo > 0) {
      const seek = () => {
        if (seekTo < audio.duration - 2) audio.currentTime = seekTo;
      };
      if (audio.readyState >= 1) seek();
      else audio.addEventListener("loadedmetadata", seek, { once: true });
    }

    try {
      fadeIn(audio);
      await audio.play();
      setPlaying(true);
      setWaitingForClick(false);
      return true;
    } catch {
      setWaitingForClick(true); // browser blocked it — needs a click first
      return false;
    }
  }, [fadeIn]);

  // try to start on arrival; if the browser blocks it, wait for a first click
  useEffect(() => {
    let cancelled = false;
    const saved = loadPosition();
    if (saved) {
      track.current = saved.index;
      resumeAt.current = saved.seconds;
    }
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
    audio.src = trackUrl(track.current);
    savePosition(track.current, 0);
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
      setWaitingForClick(false);
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
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          // roughly every 2s of playback
          if (Math.floor(audio.currentTime) % 2 === 0) {
            savePosition(track.current, audio.currentTime);
          }
        }}
        onEnded={() => {
          // short silence, then the next track
          clearTimeout(gapTimer.current);
          gapTimer.current = setTimeout(playNext, GAP_MS);
        }}
      />
      <button
        type="button"
        className={waitingForClick ? "sound-btn sound-btn--waiting" : "sound-btn"}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Turn music off" : "Turn music on"}
        title={
          waitingForClick
            ? "Music is ready — click to play"
            : playing
              ? "Turn music off"
              : "Turn music on"
        }
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
