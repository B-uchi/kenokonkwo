"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type Ref,
} from "react";
import type { Tribute } from "@/lib/types";
import { submitTribute } from "./actions";

const CLOSE_MS = 260;

type ModalHandle = { open: () => void };

export default function TributeWall({ tributes }: { tributes: Tribute[] }) {
  const [thanks, setThanks] = useState(false);
  const modalRef = useRef<ModalHandle>(null);
  const openModal = () => modalRef.current?.open();

  // hide the thank-you toast after a few seconds
  useEffect(() => {
    if (!thanks) return;
    const t = setTimeout(() => setThanks(false), 6000);
    return () => clearTimeout(t);
  }, [thanks]);

  const count = tributes.length;

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">Tributes</p>
        <h1 className="page-title">Words from those who loved him</h1>
        <div className="tributes-bar">
          <span className="tributes-count">
            {count} {count === 1 ? "tribute" : "tributes"} shared
          </span>
          <button type="button" className="btn-outline" onClick={openModal}>
            Leave a tribute
          </button>
        </div>
      </div>

      {count === 0 ? (
        <div className="tributes-empty">
          <p>No tributes have been shared yet.</p>
          <button type="button" className="btn-outline" onClick={openModal}>
            Be the first to leave one
          </button>
        </div>
      ) : (
        <div className="tribute-list">
          {tributes.map((t) => (
            <TributeCard key={t.id} tribute={t} />
          ))}
        </div>
      )}

      {count > 0 && (
        <div className="tributes-end">
          <div className="gold-rule" />
          <p>Would you like to add your own words?</p>
          <button type="button" className="btn-gold" onClick={openModal}>
            Leave a tribute
          </button>
        </div>
      )}

      <TributeModal ref={modalRef} onSubmitted={() => setThanks(true)} />

      <p className={thanks ? "toast toast--show" : "toast"} role="status">
        Thank you &mdash; your tribute will appear once the family has reviewed
        it.
      </p>
    </>
  );
}

function TributeCard({ tribute }: { tribute: Tribute }) {
  const messageRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clipped, setClipped] = useState(false);

  // only offer "Read more" when the text is actually cut off
  useEffect(() => {
    if (expanded) return;
    const measure = () => {
      const el = messageRef.current;
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
    <article className="tribute">
      <div className="tribute-mark" aria-hidden="true">
        &ldquo;
      </div>
      <p
        ref={messageRef}
        className={expanded ? "tribute-message" : "tribute-message is-clamped"}
      >
        {tribute.message}
      </p>
      {/* always rendered — hidden rather than removed, so every card is the same height */}
      <button
        type="button"
        className={
          clipped || expanded ? "tribute-more" : "tribute-more is-hidden"
        }
        onClick={() => setExpanded((v) => !v)}
        aria-hidden={!clipped && !expanded}
        tabIndex={clipped || expanded ? undefined : -1}
      >
        {expanded ? "Read less" : "Read more"}
      </button>
      <div className="tribute-by">
        <span className="tribute-name">{tribute.name}</span>
        <span className="tribute-relation">{tribute.relation}</span>
      </div>
    </article>
  );
}

function TributeModal({
  ref,
  onSubmitted,
}: {
  ref: Ref<ModalHandle>;
  onSubmitted: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useImperativeHandle(ref, () => ({
    open() {
      clearTimeout(closeTimer.current);
      setClosing(false);
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
    },
  }));

  // play the exit animation, then actually close the native dialog
  function close() {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      dialog.close();
      setClosing(false);
    }, CLOSE_MS);
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim() || pending) return;
    const formData = new FormData(e.currentTarget);
    setError("");

    startTransition(async () => {
      const result = await submitTribute(formData);
      if (!result?.ok) {
        setError(result?.message || "Something went wrong. Please try again.");
        return;
      }
      setName("");
      setRelation("");
      setMessage("");
      close();
      onSubmitted();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className={closing ? "modal modal--closing" : "modal"}
      aria-labelledby="leave-heading"
      onCancel={(e) => {
        // Esc: animate out instead of snapping shut
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        // click on the backdrop area (outside the panel)
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="modal-panel">
        <button
          type="button"
          className="modal-close"
          onClick={close}
          aria-label="Close"
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

        <form className="leave-form" onSubmit={submit}>
          <p className="eyebrow">Tributes</p>
          <h2 id="leave-heading">Leave a tribute</h2>
          <p className="leave-intro">
            Share a memory, a prayer, or a word of comfort for the family.
          </p>
          <div className="gold-rule leave-divider" />

          {/* honeypot for bots — hidden from people and screen readers */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hp-field"
            aria-hidden="true"
          />

          <div className="field-row">
            <label>
              <span className="sr-only">Your name</span>
              <input
                className="field"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              <span className="sr-only">Relationship</span>
              <input
                className="field"
                type="text"
                name="relation"
                placeholder="Relationship (e.g. Nephew)"
                maxLength={60}
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
              />
            </label>
          </div>
          <label>
            <span className="sr-only">Message</span>
            <textarea
              className="field"
              name="message"
              rows={6}
              required
              maxLength={2000}
              placeholder="Share a memory, a prayer, or a word of comfort…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="leave-actions">
            <button type="submit" className="btn-gold" disabled={pending}>
              {pending ? "Posting…" : "Post tribute"}
            </button>
            <span>Tributes appear after a short review by the family.</span>
          </div>
        </form>
      </div>
    </dialog>
  );
}
