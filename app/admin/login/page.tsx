import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/server/auth";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin/tributes");

  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <p className="eyebrow">Memorial admin</p>
        <h1>Sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
