import { useEffect, useState } from "react";

export interface PersistentStats {
    total_attacks: number;
    unique_ips: string[];
    unique_countries: string[];
    timestamps: string[];
}

export function usePersistentStats() {
    const [stats, setStats] = useState<PersistentStats>({
        total_attacks: 0,
        unique_ips: [],
        unique_countries: [],
        timestamps: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const apiUrl = import.meta.env.DEV
                    ? `/api/v1/ext/logs/persistent-stats`
                    : `${import.meta.env.VITE_GATEWAY_URL || "http://localhost:3002"}/api/v1/ext/logs/persistent-stats`;

                const response = await fetch(apiUrl, {
                    headers: { Accept: "application/json" },
                });

                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch persistent stats:", err);
            }
        };

        // Initial fetch
        fetchStats();

        // Poll every 2 seconds for updates
        const interval = setInterval(fetchStats, 2000);

        return () => clearInterval(interval);
    }, []);

    return stats;
}
