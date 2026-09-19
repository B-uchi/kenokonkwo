"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { submitRsvp } from "./rsvp-actions";

const CLOSE_MS = 260;

export default function RsvpModal({
  label,
  className = "btn-gold",
}: {
  label: string;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  function open() {
    clearTimeout(closeTimer.current);
    setClosing(false);
    setDone(false);
    setError("");
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }

  function close() {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      dialog.close();
      setClosing(false);
    }, CLOSE_MS);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError("");
    setPending(true);
    const result = await submitRsvp(formData);
    setPending(false);
    if (!result?.ok) {
      setError(result?.message || "Something went wrong. Please try again.");
      return;
    }
    form.reset();
    setDone(true);
  }

  return (
    <>
      <button type="button" className={className} onClick={open}>
        {label}
      </button>

      <dialog
        ref={dialogRef}
        className={closing ? "modal modal--closing" : "modal"}
        aria-labelledby="rsvp-heading"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
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

          {done ? (
            <div className="leave-form rsvp-done">
              <p className="eyebrow">RSVP</p>
              <h2 id="rsvp-heading">Thank you</h2>
              <p className="leave-intro">
                The family has your details and looks forward to seeing you.
              </p>
              <div className="gold-rule leave-divider" />
              <button type="button" className="btn-outline" onClick={close}>
                Close
              </button>
            </div>
          ) : (
            <form className="leave-form" onSubmit={submit}>
              <p className="eyebrow">RSVP</p>
              <h2 id="rsvp-heading">Let the family know</h2>
              <p className="leave-intro">
                So they can plan for you at the service.
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

              <label className="rsvp-label">
                <span>Your name</span>
                <input
                  className="field"
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={80}
                  placeholder="Full name"
                />
              </label>

              <div className="field-row rsvp-row">
                <label className="rsvp-label">
                  <span>Phone number</span>
                  <input
                    className="field"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    required
                    maxLength={40}
                    placeholder="e.g. 631-355-6425"
                  />
                </label>
                <label className="rsvp-label">
                  <span>How many people</span>
                  <input
                    className="field"
                    type="number"
                    name="guests"
                    min={1}
                    max={50}
                    defaultValue={1}
                    inputMode="numeric"
                  />
                </label>
              </div>

              <label className="rsvp-label">
                <span>
                  Email <em>(optional)</em>
                </span>
                <input
                  className="field"
                  type="email"
                  name="email"
                  autoComplete="email"
                  maxLength={120}
                  placeholder="you@example.com"
                />
              </label>

              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="leave-actions">
                <button type="submit" className="btn-gold" disabled={pending}>
                  {pending ? "Sending…" : "Send RSVP"}
                </button>
                <span>Only the family sees this.</span>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
