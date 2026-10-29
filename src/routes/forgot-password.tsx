import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, KeyRound, Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { useAuth } from "@/context/AuthContext";

const title = "Reset Password — Smart Food Distribution System";
const description =
  "Reset your Smart Food Distribution System password and get back to rescuing surplus food in minutes.";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Please enter the email linked to your account.");
      return;
    }
    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (password.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(email, currentPassword, password);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError("");
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="You can now sign in with your new password.">
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-success/15 text-success">
            <CheckCircle2 className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-foreground">All set</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password for <span className="font-medium text-foreground">{email}</span> has been
            changed.
          </p>
          <Link
            to="/login"
            className="gradient-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Back to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and current password to set a new one."
      footer={
        <p>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Go back to login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <FormField
          id="forgot-email"
          label="Registered email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail className="size-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormField
          id="current-password"
          label="Current password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter current password"
          icon={<Lock className="size-4" />}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <FormField
          id="forgot-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          icon={<Lock className="size-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <FormField
          id="forgot-confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter new password"
          icon={<Lock className="size-4" />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="gradient-primary flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <KeyRound className="size-4" /> {loading ? "Updating password..." : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
