import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Activity, Network, Globe, Gauge } from "lucide-react";
import { usePersistentStats } from "@/lib/usePersistentStats";

export default function AttackOverview() {
  const stats = usePersistentStats();

  const totalAttacks = stats.total_attacks;
  const uniqueIPs = stats.unique_ips.length;
  const totalCountries = stats.unique_countries.length;

  // Calculate attack rate
  let attackRate = 0;
  if (stats.timestamps.length > 1) {
    const timestamps = stats.timestamps
      .map(t => new Date(t).getTime())
      .filter(t => !isNaN(t))
      .sort((a, b) => a - b);
    
    if (timestamps.length > 1) {
      const timeStart = timestamps[0];
      const timeEnd = timestamps[timestamps.length - 1];
      const hoursDiff = (timeEnd - timeStart) / (1000 * 60 * 60);

      if (hoursDiff > 0.0002) {
        attackRate = totalAttacks / hoursDiff;
      } else {
        attackRate = totalAttacks * 3600;
      }
    }
  }

  const features = [
    {
      name: totalAttacks.toString(),
      className: "col-span-1 md:col-span-1 lg:col-span-2",
      Icon: Activity,
      description: "Total Attacks",
      cta: "All detected malicious events logged",
    },
    {
      name: uniqueIPs.toString(),
      className: "col-span-1 md:col-span-1 lg:col-span-1",
      Icon: Network,
      description: "Unique IPs",
      cta: "Distinct sources involved in attacks",
    },
    {
      name: totalCountries.toString(),
      className: "col-span-1 md:col-span-1 lg:col-span-1",
      Icon: Globe,
      description: "Total Countries",
      cta: "Geographic spread of hostile actors",
    },
    {
      name: `${attackRate.toFixed(2)}/hr`,
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
