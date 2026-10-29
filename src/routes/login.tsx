import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { useAuth } from "@/context/AuthContext";

const title = "Login — Smart Food Distribution System";
const description =
  "Sign in as a donor, partner organization or admin to manage food donations, pickups and deliveries.";

const demoAccounts = [
  { role: "Donor", email: "donor@demo.com", password: "donor123" },
  { role: "Organization", email: "org@demo.com", password: "org123" },
  { role: "Admin", email: "admin@smartfoodhub.org", password: "admin123" },
];

export const Route = createFileRoute("/login")({
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
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError("");
      void navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue rescuing food and serving meals."
      footer={
        <p>
          New here?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
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
          id="login-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail className="size-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <FormField
            id="login-password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            icon={<Lock className="size-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-9.5 right-3.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="gradient-primary flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <LogIn className="size-4" /> {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-8 rounded-2xl border border-border/70 bg-muted/60 p-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Demo accounts
        </p>
        <ul className="mt-3 space-y-2">
          {demoAccounts.map((account) => (
            <li key={account.email} className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-foreground">{account.role}</span>
              <button
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setError("");
                }}
                className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Use {account.email}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AuthShell>
  );
}
