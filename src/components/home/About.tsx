import { Building2, HandHeart, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: HandHeart,
    title: "For Donors",
    text: "Families, event halls and temples post surplus food in seconds after a function ends.",
  },
  {
    icon: Building2,
    title: "For Organizations",
    text: "Verified orphanages and old age homes claim only the number of meals they can serve.",
  },
  {
    icon: ShieldCheck,
    title: "For Safety",
    text: "A fixed five hour window and hygiene confirmation keep every rescued meal safe to eat.",
  },
];

export function About() {
  return (
    <section id="about" className="section-y">
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            About the platform
          </span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Good food should never end up in a bin
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Large events routinely cook for far more people than turn up. At the same time, homes
            just a few kilometres away are stretching their budget for the next meal. Smart Food
            Distribution closes that gap with a single coordinated workflow: donate, notify, split,
            collect, deliver.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every donation is time-bound, location-aware and fully tracked, so donors know exactly
            where their food went and organizations never travel for food that has already expired.
          </p>
        </div>

        <div className="grid gap-4">
          {pillars.map((p) => (
            <article
              key={p.title}
              className="card-lift flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="gradient-primary flex size-12 shrink-0 items-center justify-center rounded-xl">
                <p.icon className="size-5 text-primary-foreground" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
