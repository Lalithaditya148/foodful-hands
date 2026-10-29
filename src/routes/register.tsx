import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  HeartHandshake,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  UserPlus,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { useAuth, type UserRole } from "@/context/AuthContext";

const title = "Create Account — Smart Food Distribution System";
const description =
  "Register as a food donor or as an orphanage / old age home partner and join the food rescue network.";

export const Route = createFileRoute("/register")({
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
  component: RegisterPage,
});

const roleOptions: {
  value: Extract<UserRole, "donor" | "organization">;
  label: string;
  hint: string;
  icon: typeof User;
}[] = [
  {
    value: "donor",
    label: "Donor",
    hint: "Households, hotels, event organisers",
    icon: HeartHandshake,
  },
  {
    value: "organization",
    label: "Organization",
    hint: "Orphanages & old age homes",
    icon: Building2,
  },
];

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"donor" | "organization">("donor");
  const [form, setForm] = useState({
    name: "",
    managerName: "",
    orgType: "orphanage" as "orphanage" | "old_age_home",
    email: "",
    phone: "",
    city: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [pendingNotice, setPendingNotice] = useState(false);

  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { name, managerName, orgType, email, phone, city, address, password, confirmPassword } =
      form;

    if (!name.trim() || !email.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      setError("Please fill in every field before continuing.");
      return;
    }
    if (role === "organization" && !managerName.trim()) {
      setError("Please enter the manager's name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number with at least 10 digits.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: name.trim(),
        managerName: role === "organization" ? managerName.trim() : undefined,
        orgType: role === "organization" ? orgType : undefined,
        email,
        phone,
        city,
        address,
        password,
        role,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }

      setError("");
      if (role === "organization") {
        setPendingNotice(true);
        return;
      }
      void navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  }

  if (pendingNotice) {
    return (
      <AuthShell
        title="Registration submitted"
        subtitle="Your organization profile is now waiting for admin verification."
      >
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-soft">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-success/15 text-success">
            <CheckCircle2 className="size-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
            Approval pending
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our admin team verifies every orphanage and old age home before donations are routed to
            them. You will be able to sign in as soon as your home is approved.
          </p>
          <Link
            to="/login"
            className="gradient-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Go to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join the network in under a minute — no paperwork required."
      footer={
        <p>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in instead
          </Link>
        </p>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const active = role === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setRole(option.value)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                active
                  ? "border-primary bg-primary/8 shadow-soft"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/60"
              }`}
            >
              <span
                className={`flex size-9 items-center justify-center rounded-xl ${
                  active
                    ? "gradient-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                <Icon className="size-4.5" />
              </span>
              <span className="mt-3 block text-sm font-semibold text-foreground">
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{option.hint}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <FormField
          id="register-name"
          label={role === "donor" ? "Full name" : "Organization name"}
          placeholder={role === "donor" ? "Ravi Kumar" : "Sunrise Orphanage"}
          icon={role === "donor" ? <User className="size-4" /> : <Building2 className="size-4" />}
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        {role === "organization" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="register-manager"
              label="Manager / In-charge name"
              placeholder="Sister Mary / Ramesh Kumar"
              icon={<User className="size-4" />}
              value={form.managerName}
              onChange={(e) => update("managerName", e.target.value)}
            />
            <div>
              <label
                htmlFor="register-orgtype"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Organization type
              </label>
              <select
                id="register-orgtype"
                value={form.orgType}
                onChange={(e) =>
                  update("orgType", e.target.value as "orphanage" | "old_age_home")
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/25"
              >
                <option value="orphanage">Orphanage / Children Home</option>
                <option value="old_age_home">Old Age Home / Elder Care</option>
              </select>
            </div>
          </div>
        )}

        <FormField
          id="register-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<Mail className="size-4" />}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="register-phone"
            label="Phone number"
            placeholder="+91 90000 00000"
            icon={<Phone className="size-4" />}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <FormField
            id="register-city"
            label="City"
            placeholder="Vijayawada"
            icon={<MapPin className="size-4" />}
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </div>

        <FormField
          id="register-address"
          label="Pickup / delivery address"
          placeholder="Street, area, landmark"
          icon={<MapPin className="size-4" />}
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="register-password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            icon={<Lock className="size-4" />}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
          <FormField
            id="register-confirm"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter password"
            icon={<Lock className="size-4" />}
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
          />
        </div>

        {role === "organization" ? (
          <p className="rounded-xl bg-muted/70 p-3 text-xs text-muted-foreground">
            Organization accounts are activated after admin verification to keep the network safe
            for donors.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="gradient-primary flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <UserPlus className="size-4" /> {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
