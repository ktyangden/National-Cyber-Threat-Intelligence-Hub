import { useEffect, useState } from "react";

export interface CountryCounts {
    [country: string]: number;
}

export function useLiveCountryCounts() {
    const [countryCounts, setCountryCounts] = useState<CountryCounts>({});

    useEffect(() => {
        const fetchCountryCounts = async () => {
            try {
                const apiUrl = import.meta.env.DEV
                    ? `/api/v1/ext/logs/country-counts`
                    : `${import.meta.env.VITE_GATEWAY_URL || "http://localhost:3002"}/api/v1/ext/logs/country-counts`;

                const response = await fetch(apiUrl, {
                    headers: { Accept: "application/json" },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCountryCounts(data);
                }
            } catch (err) {
                console.error("Failed to fetch country counts:", err);
            }
        };

        // Initial fetch
        fetchCountryCounts();

        // Poll every 3 seconds for live updates
        const interval = setInterval(fetchCountryCounts, 3000);

        return () => clearInterval(interval);
    }, []);

    return countryCounts;
}
