import { getColorIntensity } from "@/lib/mapUtils";
import { getCountryName } from "@/lib/countryNames";

interface Props { countryCounts: Record<string, number>, maxCount: number }

export default function TopCountriesTable({ countryCounts, maxCount }: Props) {
  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (topCountries.length === 0) return null;

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground">
          Top 10 Countries by Attack Count
        </h3>
      </div>

      <div className="overflow-x-auto rounded-b-xl">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Attacks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Intensity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {topCountries.map(([countryCode, count], index) => (
              <tr key={countryCode} className="hover:bg-muted/50 bg-background border border-muted transition-colors">
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {index + 1}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {getCountryName(countryCode)}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      ({countryCode})
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-foreground">{count}</td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-24 rounded" style={{ backgroundColor: getColorIntensity(count, maxCount)}}/>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((count / maxCount) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}