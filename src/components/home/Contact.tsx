import { ExternalLink, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/api";

const details = [
  { icon: Phone, label: "Helpline", value: "+91 98765 43210" },
  { icon: Mail, label: "Email", value: "help@smartfoodhub.org" },
  { icon: MapPin, label: "Office", value: "Benz Circle, Vijayawada, AP" },
];

export function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  return (
    <section id="contact" className="section-y">
      <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Contact</span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Have surplus food or a home to register?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Reach out and our coordination team will help you onboard, verify your organization, or
            plan a large event donation in advance.
          </p>

          <ul className="mt-8 space-y-4">
            {details.map((d) => (
              <li
                key={d.label}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <span className="bg-secondary flex size-11 items-center justify-center rounded-xl">
                  <d.icon className="size-5 text-primary" />
                </span>
                <span>
                  <span className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {d.label}
                  </span>
                  {d.label === "Office" ? (
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Benz+Circle+Vijayawada+AP"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary"
                    >
                      {d.value} <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    <span className="block text-sm font-semibold text-foreground">{d.value}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <iframe
              title="Smart Food Distribution office map"
              src="https://www.google.com/maps?q=Benz%20Circle%2C%20Vijayawada%2C%20AP&output=embed"
              className="h-56 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");
            try {
              await apiRequest("/contact", { method: "POST", body: JSON.stringify(form) });
              setForm({ name: "", phone: "", email: "", message: "" });
              setSent(true);
            } catch (requestError) {
              setSent(false);
              setError(
                requestError instanceof Error
                  ? requestError.message
                  : "Unable to send your message.",
              );
            } finally {
              setLoading(false);
            }
          }}
          className="rounded-[1.75rem] border border-border bg-card p-8 shadow-elevated"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Full name"
              id="name"
              placeholder="Ramesh Varma"
              value={form.name}
              onChange={(value) => setForm((current) => ({ ...current, name: value }))}
            />
            <Field
              label="Mobile number"
              id="phone"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
            />
          </div>
          <div className="mt-5">
            <Field
              label="Email"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            />
          </div>
          <div className="mt-5">
            <label
              htmlFor="message"
              className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              required
              placeholder="Tell us about your event or organization"
              value={form.message}
              onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <button
            type="submit"
            className="gradient-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <Send className="size-4" /> {loading ? "Sending..." : "Send message"}
          </button>

          {error && (
            <p className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-center text-sm font-medium text-danger">
              {error}
            </p>
          )}

          {sent && (
            <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-center text-sm font-medium text-primary">
              Thanks! Our team will get back to you within one working day.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}
