import { Leaf, Mail, MapPin, Phone } from "lucide-react";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Donate Food", href: "/register" },
      { label: "For Organizations", href: "/register" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Features", href: "/#features" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Food Safety", href: "/#features" },
      { label: "About Us", href: "/#about" },
      { label: "Our Impact", href: "/#impact" },
      { label: "Contact", href: "/#contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-page grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="gradient-primary flex size-10 items-center justify-center rounded-xl">
              <Leaf className="size-5 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-bold">Smart Food Distribution</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-background/70">
            A food rescue network that connects surplus food from events with verified orphanages
            and old age homes before it ever goes to waste.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-background/70">
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 text-primary-glow" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-primary-glow" /> help@smartfoodhub.org
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-primary-glow" /> Benz Circle, Vijayawada
            </li>
          </ul>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold tracking-[0.16em] text-background uppercase">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-background/70">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition-colors hover:text-primary-glow">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-background/15">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-background/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Smart Food Distribution System. All rights reserved.</p>
          <p>Every meal rescued is a meal served.</p>
        </div>
      </div>
    </footer>
  );
}
