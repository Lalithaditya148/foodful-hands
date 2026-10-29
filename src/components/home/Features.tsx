import { featureList } from "@/data/site";

export function Features() {
  return (
    <section id="features" className="section-y">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">Features</span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Everything a rescue network needs
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Built around the realities of Indian event catering: large quantities, tight timelines
            and multiple homes sharing one donation.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureList.map((f) => (
            <article
              key={f.title}
              className="card-lift group rounded-2xl border border-border bg-card p-7 shadow-soft"
            >
              <span className="bg-secondary group-hover:gradient-primary flex size-12 items-center justify-center rounded-xl transition-all">
                <f.icon className="size-5 text-primary transition-colors group-hover:text-primary-foreground" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
