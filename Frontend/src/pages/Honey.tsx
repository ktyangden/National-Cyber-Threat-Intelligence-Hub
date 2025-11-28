import { useState } from "react";
import Heatmap from "./Honey/Map";
import AllCountriesList from "./Honey/AllCountriesList";
import TopCountriesTable from "./Honey/TopCountriesTable";
import AttackOverview from "./Honey/AttackOverview";
import AttacksOverTimeChart from "./Honey/AttacksOverTimeChart";
import AttackDistributionChart from "./Honey/AttackDistributionChart";
import { useLiveAttackStats } from "@/lib/useLiveAttackStats";

export default function Honey() {
  const [countryCounts, setCountryCounts] = useState<Record<string, number>>({});
  const [maxCount, setMaxCount] = useState<number>(1);
  const stats = useLiveAttackStats();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <h1 className="text-2xl sm:text-4xl font-bold">Honeypot Intelligence</h1>
      <AttackOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttacksOverTimeChart logs={stats.logs} />
        <AttackDistributionChart />
      </div>

      <Heatmap onDataUpdate={({countryCounts, maxCount})=>{setCountryCounts(countryCounts), setMaxCount(maxCount)}}/>
      <TopCountriesTable countryCounts={countryCounts} maxCount={maxCount} />
      <AllCountriesList countryCounts={countryCounts} maxCount={maxCount} />
    </div>
  );
}
