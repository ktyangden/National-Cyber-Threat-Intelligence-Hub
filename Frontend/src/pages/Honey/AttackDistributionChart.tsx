import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useLiveCountryCounts } from "@/lib/useLiveCountryCounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AttackDistributionChart() {
  const countryCounts = useLiveCountryCounts();

  const chartData = useMemo(() => {
    const entries = Object.entries(countryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 countries

    const labels = entries.map(entry => entry.name);
    const data = entries.map(entry => entry.value);
    
    // Generate red gradient colors from light red to dark red
    const colors = entries.map((_, index) => {
      const intensity = ((index + 1) / entries.length) * 100;
      return `hsl(0, 100%, ${Math.max(30, 90 - intensity)}%)`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Attacks',
          data,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace(/\d+%\)$/, '25%)')),
          borderWidth: 1,
        },
      ],
    };
  }, [countryCounts]);

  const options = {
    indexAxis: 'y' as const, // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Attacks: ${context.parsed.x}`;
          }
        }
      },
      title: {
        display: false,
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
        }
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
          }
        }
      }
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Top 10 Countries by Attacks</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(countryCounts).length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No country data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div style={{ width: '100%', height: 400, minWidth: 300 }}>
              <Bar data={chartData} options={options} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
