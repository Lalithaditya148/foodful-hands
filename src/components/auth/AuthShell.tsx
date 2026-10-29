import { Link } from "@tanstack/react-router";
import { ArrowLeft, Leaf } from "lucide-react";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

const highlights = [
  "Auto 5-hour expiry with live countdown on every donation",
  "Smart priority routing to the nearest verified homes",
  "Split quantity acceptance so nothing is left behind",
];

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="gradient-hero relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-primary-foreground">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">Smart Food Distribution</span>
        </Link>

        <div className="max-w-md text-primary-foreground">
          <h2 className="font-display text-4xl leading-tight font-bold">
            Every rescued meal reaches someone who needs it.
          </h2>
          <ul className="mt-8 space-y-4 text-sm text-primary-foreground/85">
            {highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary-foreground/80" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/70">
          Secure platform — your data is stored safely on our servers.
        </p>

        <span className="animate-float-soft pointer-events-none absolute -right-20 -bottom-24 size-72 rounded-full bg-white/10 blur-2xl" />
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="animate-rise w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>

          <h1 className="mt-6 font-display text-3xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
