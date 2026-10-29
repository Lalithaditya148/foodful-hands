import { howItWorks } from "@/data/site";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-y bg-secondary/50">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            From leftover to delivered
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Six steps that move a tray of surplus biryani from a wedding hall to a children&apos;s
            home while it is still fresh.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {howItWorks.map((item) => (
            <li
              key={item.step}
              className="card-lift relative rounded-2xl border border-border bg-card p-7 shadow-soft"
            >
              <span className="text-gradient font-display text-4xl font-extrabold">
                {item.step}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-center text-sm font-semibold text-muted-foreground">
          Register → Donate → Notify → Accept → Pickup → Delivery → Food reaches needy people
        </p>
      </div>
    </section>
  );
}
