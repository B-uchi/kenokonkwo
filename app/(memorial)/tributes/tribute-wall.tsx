"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type FormEvent,
  type Ref,
} from "react";
import type { Tribute } from "@/lib/tributes";

const CLOSE_MS = 260;

type ModalHandle = { open: () => void };

export default function TributeWall({
  initialTributes,
}: {
  initialTributes: Tribute[];
}) {
  const [tributes, setTributes] = useState(initialTributes);
  const [newId, setNewId] = useState<string | null>(null);
  const [thanks, setThanks] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<ModalHandle>(null);
  const openModal = () => modalRef.current?.open();

  // hide the thank-you toast after a few seconds
  useEffect(() => {
    if (!thanks) return;
    const t = setTimeout(() => setThanks(false), 4500);
    return () => clearTimeout(t);
  }, [thanks]);

  function add(tribute: Tribute) {
    setTributes((prev) => [tribute, ...prev]);
    setNewId(tribute.id);
    setThanks(true);
    requestAnimationFrame(() =>
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

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
        <div ref={listRef} className="tribute-grid" aria-live="polite">
          {tributes.map((t) => (
            <article
              key={t.id}
              className={t.id === newId ? "tribute tribute--new" : "tribute"}
            >
              <div className="tribute-mark" aria-hidden="true">
                &ldquo;
              </div>
              <p className="tribute-message">{t.message}</p>
              <div className="tribute-by">
                <span className="tribute-name">{t.name}</span>
                <span className="tribute-relation">{t.relation}</span>
              </div>
            </article>
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

      <TributeModal ref={modalRef} onAdd={add} />

      <p className={thanks ? "toast toast--show" : "toast"} role="status">
        Thank you &mdash; your tribute has been added.
      </p>
    </>
  );
}

function TributeModal({
  ref,
  onAdd,
}: {
  ref: Ref<ModalHandle>;
  onAdd: (t: Tribute) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [closing, setClosing] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [message, setMessage] = useState("");

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
    const m = message.trim();
    if (!m) return;

    onAdd({
      id: crypto.randomUUID(),
      name: name.trim() || "Anonymous",
      relation: relation.trim() || "Friend of the family",
      message: m,
    });
    setName("");
    setRelation("");
    setMessage("");
    close();
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

          <div className="leave-actions">
            <button type="submit" className="btn-gold">
              Post tribute
            </button>
            <span>Tributes appear after a short review by the family.</span>
          </div>
        </form>
      </div>
    </dialog>
  );
}
