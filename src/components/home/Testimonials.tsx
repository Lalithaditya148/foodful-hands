import { Quote } from "lucide-react";
import { testimonials } from "@/data/site";

export function Testimonials() {
  return (
    <section className="section-y bg-secondary/50">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Voices from the network
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="card-lift rounded-2xl border border-border bg-card p-8 shadow-soft"
            >
              <Quote className="size-8 text-primary/30" />
              <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <span className="gradient-primary flex size-11 items-center justify-center rounded-full font-display text-sm font-bold text-primary-foreground">
                  {t.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
