"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="admin-login-form">
      <label>
        <span>Username</span>
        <input
          className="field"
          name="username"
          autoComplete="username"
          defaultValue={state?.username}
          required
        />
      </label>
      <label>
        <span>Password</span>
        <input
          className="field"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state && !state.ok && (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" className="btn-gold" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
