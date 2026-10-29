import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { RoleWorkspace } from "@/components/home/RoleWorkspace";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const title = "Dashboard — Smart Food Distribution System";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) {
      void navigate({ to: "/login" });
    }
  }, [ready, user, navigate]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navbar />
      <main>
        <div className="container-page flex items-center justify-between gap-4 py-8">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
              Authenticated workspace
            </span>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Your rescue dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your tools are tailored to your account role.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
          >
            View homepage
          </Link>
        </div>
        <RoleWorkspace />
      </main>
      <Footer />
    </div>
  );
}
