import { ArrowRight, Clock, HeartHandshake, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-food-rescue.jpg";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="gradient-hero absolute inset-0 -z-10 opacity-[0.07]" />
      <div className="bg-primary/20 absolute -top-32 -right-24 -z-10 size-96 rounded-full blur-3xl" />
      <div className="bg-accent/20 absolute -bottom-40 -left-24 -z-10 size-96 rounded-full blur-3xl" />

      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        <div className="animate-rise">
          <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide text-primary">
            <Sparkles className="size-3.5" /> Zero food waste, powered by real-time matching
          </span>

          <h1 className="mt-6 text-4xl leading-[1.05] font-extrabold text-foreground sm:text-5xl lg:text-6xl">
            Smart Food <span className="text-gradient">Rescue Hub</span>
          </h1>
          <p className="mt-4 font-display text-xl font-semibold text-muted-foreground sm:text-2xl">
            Connecting Surplus Food with Hope
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Post leftover food from weddings, functions and temple events. Verified orphanages and
            old age homes nearby are notified instantly, accept exactly what they need, and collect
            it before the five hour safety window closes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/register"
              className="gradient-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-transform hover:-translate-y-0.5"
            >
              Donate Food <ArrowRight className="size-4" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground shadow-soft transition-colors hover:bg-secondary"
            >
              Explore
            </a>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            {[
              { k: "48,200+", v: "Meals rescued" },
              { k: "310", v: "Verified homes" },
              { k: "5 hrs", v: "Safety window" },
            ].map((item) => (
              <div key={item.v}>
                <dt className="font-display text-2xl font-bold text-foreground">{item.k}</dt>
                <dd className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {item.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] shadow-elevated">
            <img
              src={heroImage}
              alt="Volunteers packing rescued meals into containers at a community food rescue center"
              width={1600}
              height={1104}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="glass-panel animate-float absolute bottom-4 left-4 w-56 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Clock className="size-4 text-warning" /> Remaining time
            </div>
            <p className="mt-1 font-display text-xl font-bold text-foreground">3h 45m</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="gradient-accent h-full w-3/4 rounded-full" />
            </div>
            <p className="mt-2 text-[11px] font-medium text-muted-foreground">
              Available until 7:00 PM
            </p>
          </div>

          <div className="glass-panel absolute top-4 right-4 w-52 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <HeartHandshake className="size-4 text-primary" /> 100 meals posted
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">3 homes accepted</p>
            <p className="text-xs text-muted-foreground">Remaining: 0 · Completed</p>
          </div>
        </div>
      </div>
    </section>
  );
}
