import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Features } from "@/components/home/Features";
import { Statistics } from "@/components/home/Statistics";
import { Testimonials } from "@/components/home/Testimonials";
import { Contact } from "@/components/home/Contact";
import { RoleWorkspace } from "@/components/home/RoleWorkspace";

const title = "Smart Food Rescue Hub — Smart Food Distribution System";
const description =
  "Connect surplus event food with verified orphanages and old age homes. Auto 5-hour expiry, live countdown, quantity splitting and nearby notifications.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <RoleWorkspace />
        <About />
        <HowItWorks />
        <Features />
        <Statistics />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
