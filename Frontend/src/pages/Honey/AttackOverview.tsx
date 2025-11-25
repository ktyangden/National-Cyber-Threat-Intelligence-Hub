import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { Activity, Network, Globe, Gauge } from "lucide-react";

const features = [
    {
      name: "123456789",
      className: "col-span-1 md:col-span-1 lg:col-span-2",
      background: <div className="h-full w-full bg-purple-100" />,
      Icon: Activity,
      description: "Total Attacks",
      cta: "All detected malicious events logged"
    },
    {
      name: "9876",
      className: "col-span-1 md:col-span-1 lg:col-span-1",
      background: <div className="h-full w-full bg-blue-100" />,
      Icon: Network,
      description: "Unique IPs",
      cta: "Distinct sources involved in attacks"
    },
    {
      name: "543",
      className: "col-span-1 md:col-span-1 lg:col-span-1",
      background: <div className="h-full w-full bg-purple-100" />,
      Icon: Globe,
      description: "Total Countries",
      cta: "Geographic spread of hostile actors"
    },
    {
      name: "21/hr",
      className: "col-span-1 md:col-span-1 lg:col-span-2",
      background: <div className="h-full w-full bg-blue-100" />,
      Icon: Gauge,
      description: "Attack Rate",
      cta: "Average attacks occurring each hour"
    }
]
  

export default function AttackOverview() {
  return (
    <section id="#atk-overview">
        <div className="flex flex-col items-left w-full mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Attack Overview</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Key metrics summarizing current activity
          </p>
        </div>
        <BentoGrid>
            {features.map((feature, idx) => (
                <BentoCard key={idx} {...feature} />
            ))}
        </BentoGrid>
    </section>
  )
}
