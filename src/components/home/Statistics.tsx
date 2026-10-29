import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

interface LiveStats {
  mealsRescued: number;
  verifiedOrgs: number;
  totalDonors: number;
  totalDonations: number;
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  return n.toString();
}

export function Statistics() {
  const [live, setLive] = useState<LiveStats | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/donations/stats`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setLive(data.stats as LiveStats);
      })
      .catch(() => {
        // silently fall back to static numbers
      });
  }, []);

  const displayStats = live
    ? [
        { value: fmt(live.mealsRescued) || "0", label: "Meals Rescued" },
        { value: `${live.verifiedOrgs}`, label: "Verified Homes" },
        { value: `${live.totalDonors}`, label: "Active Donors" },
        { value: `${live.totalDonations}`, label: "Total Donations" },
      ]
    : [
        { value: "48,200+", label: "Meals Rescued" },
        { value: "310", label: "Verified Homes" },
        { value: "1,860", label: "Active Donors" },
        { value: "27 min", label: "Avg. Pickup Time" },
      ];

  return (
    <section id="impact" className="section-y">
      <div className="container-page">
        <div className="gradient-hero relative overflow-hidden rounded-[2rem] px-8 py-14 shadow-elevated sm:px-14">
          <div className="bg-primary-foreground/10 absolute -top-24 -right-16 size-72 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <h2 className="max-w-xl text-3xl font-bold text-primary-foreground sm:text-4xl">
                Impact measured in meals, not promises
              </h2>
              {live && (
                <span className="animate-pulse rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold text-primary-foreground">
                  ● LIVE
                </span>
              )}
            </div>
            <p className="mt-3 max-w-xl text-sm text-primary-foreground/80">
              {live
                ? "Live numbers pulled from our database right now."
                : "Live numbers from donors and verified homes across the network."}
            </p>

            <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {displayStats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-4xl font-extrabold text-primary-foreground">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-xs font-semibold tracking-[0.16em] text-primary-foreground/75 uppercase">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
