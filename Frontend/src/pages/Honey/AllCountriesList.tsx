import { getColorIntensity } from "@/lib/mapUtils";

interface Props {
  countryCounts: Record<string, number>, maxCount: number;
}

export default function AllCountriesList({ countryCounts, maxCount }: Props) {
  const entries = Object.entries(countryCounts).sort(([, a], [, b]) => b - a);

  if (entries.length === 0 || entries.length > 50) return null;

  return (
    <div className="border rounded-lg bg-card p-4">
      <h3 className="font-semibold text-foreground mb-3">All Countries</h3>
      <div className="flex flex-wrap gap-2">
        {entries.map(([country, count]) => (
          <div key={country} className="px-3 py-1 rounded text-xs border" style={{ backgroundColor: getColorIntensity(count, maxCount) + "20", borderColor: getColorIntensity(count, maxCount)}}>
            <span className="font-mono font-semibold">{country}</span>
            <span className="ml-2 text-muted-foreground">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
