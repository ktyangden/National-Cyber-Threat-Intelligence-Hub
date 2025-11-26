import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Activity, Network, Globe, Gauge } from "lucide-react";
import { useLiveAttackStats } from "@/lib/useLiveAttackStats";

export default function AttackOverview() {
  const stats = useLiveAttackStats();

  const features = [
    {
      name: stats.totalAttacks.toString(),
      className: "col-span-1 md:col-span-1 lg:col-span-2",
      Icon: Activity,
      description: "Total Attacks",
      cta: "All detected malicious events logged",
    },
    {
      name: stats.uniqueIPs.toString(),
      className: "col-span-1 md:col-span-1 lg:col-span-1",
      Icon: Network,
      description: "Unique IPs",
      cta: "Distinct sources involved in attacks",
    },
    {
      name: stats.totalCountries.toString(),
      className: "col-span-1 md:col-span-1 lg:col-span-1",
      Icon: Globe,
      description: "Total Countries",
      cta: "Geographic spread of hostile actors",
    },
    {
      name: `${stats.attackRate}/hr`,
      className: "col-span-1 md:col-span-1 lg:col-span-2",
      Icon: Gauge,
      description: "Attack Rate",
      cta: "Average attacks occurring each hour",
    },
  ];

  return (
    <section id="#atk-overview">
      <div className="flex flex-col w-full mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Attack Overview</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Live metrics summarizing current activity
        </p>
      </div>

      <BentoGrid>
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </BentoGrid>
    </section>
  );
}
