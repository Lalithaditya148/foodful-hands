import { Link } from "@tanstack/react-router";
import { Leaf, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Features", href: "/#features" },
  { label: "Impact", href: "/#impact" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-panel border-b border-border/60" : "bg-transparent"
      }`}
    >
      <nav className="container-page flex h-18 items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="gradient-primary flex size-10 items-center justify-center rounded-xl shadow-soft">
            <Leaf className="size-5 text-primary-foreground" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-bold text-foreground">
              Smart Food
            </span>
            <span className="block text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Distribution
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Dashboard
              </Link>
              <span className="rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <LogOut className="size-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="gradient-primary rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Donate Food
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="glass-panel animate-rise border-t border-border/60 lg:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="mb-2 block rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-foreground hover:bg-secondary"
                  >
                    Dashboard
                  </Link>
                  <div className="mb-2 rounded-xl bg-secondary px-4 py-3 text-center text-sm font-semibold text-foreground">
                    {user.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void logout();
                    }}
                    className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground"
                  >
                    <LogOut className="size-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="mb-2 block rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold text-foreground"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="gradient-primary block rounded-xl px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Donate Food
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
