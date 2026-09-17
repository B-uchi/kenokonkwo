"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Submit button that disables while its form's action runs, with optional confirm. */
export default function SubmitButton({
  children,
  className = "admin-btn",
  confirm,
  label,
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  confirm?: string;
  label?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending || disabled}
      aria-label={label}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
