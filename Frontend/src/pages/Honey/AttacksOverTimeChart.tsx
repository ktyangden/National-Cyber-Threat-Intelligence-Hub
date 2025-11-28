import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { LogEntry } from "@/lib/useLiveAttackStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttacksOverTimeChartProps {
  logs: LogEntry[];
}

export default function AttacksOverTimeChart({ logs }: AttacksOverTimeChartProps) {
  const chartData = useMemo(() => {
    if (!logs.length) return [];

    const timestamps = logs
      .map((l) => (l.timestamp ? new Date(l.timestamp).getTime() : 0))
      .filter((t) => t > 0)
      .sort((a, b) => a - b);

    if (!timestamps.length) return [];

    const startTime = timestamps[0];
    const endTime = timestamps[timestamps.length - 1];
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);

    let timeFormat: "minute" | "hour" | "day" = "minute";
    if (durationHours > 24) {
      timeFormat = "day";
    } else if (durationHours > 1) {
      timeFormat = "hour";
    }

    const groupedData: Record<string, number> = {};

    timestamps.forEach((t) => {
      const date = new Date(t);
      let key = "";

      if (timeFormat === "minute") {
        key = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (timeFormat === "hour") {
        key = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else {
        key = date.toLocaleDateString();
      }

      groupedData[key] = (groupedData[key] || 0) + 1;
    });

    return Object.entries(groupedData).map(([time, count]) => ({
      time,
      count,
    }));
  }, [logs]);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Attacks Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
