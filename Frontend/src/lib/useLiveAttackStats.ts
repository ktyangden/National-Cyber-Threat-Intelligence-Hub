import { useEffect, useState } from "react";

export interface AttackStats {
    totalAttacks: number;
    uniqueIPs: number;
    totalCountries: number;
    attackRate: number;
    logs: LogEntry[];
}

export interface LogEntry {
    src_ip?: string;
    ip?: string;
    source_ip?: string;
    country?: string;
    timestamp?: string;
}

export function useLiveAttackStats() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Load historical logs on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const apiUrl = import.meta.env.DEV
                    ? `/api/v1/ext/logs/recent-logs?limit=1000`
                    : `${import.meta.env.VITE_GATEWAY_URL || "http://localhost:3002"}/api/v1/ext/logs/recent-logs?limit=1000`;

                const response = await fetch(apiUrl, {
                    headers: { Accept: "application/json" },
                });

                if (response.ok) {
                    const data = await response.json();
                    const historicalLogs = data.logs || [];
                    console.log(`Loaded ${historicalLogs.length} historical logs`);
                    if (historicalLogs.length > 0) {
                        console.log("Sample log entry:", historicalLogs[0]);
                    }
                    setLogs(historicalLogs);
                }
            } catch (err) {
                console.error("Failed to load historical logs:", err);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        loadHistory();
    }, []);

    // WebSocket connection
    useEffect(() => {
        // Don't connect to WebSocket until history is loaded
        if (isLoadingHistory) return;

        let ws: WebSocket | null = null;
        let reconnectTimeout: ReturnType<typeof setTimeout>;
        let isMounted = true;

        const connect = () => {
            if (!isMounted) return;

            try {
                ws = new WebSocket(`ws://${window.location.host}/ws/logs/`);

                ws.onopen = () => {
                    if (isMounted) {
                        console.log("WebSocket connected");
                    }
                };

                ws.onmessage = (event) => {
                    if (!isMounted) return;

                    try {
                        const message = JSON.parse(event.data);
                        const data = message.data || message;

                        if (!data || typeof data !== "object") return;
                        // Check for any IP field
                        if (!data.src_ip && !data.ip && !data.source_ip) return;

                        setLogs((prev) => {
                            const updated = [...prev, data];
                            if (updated.length > 1000) {
                                return updated.slice(-1000);
                            }
                            return updated;
                        });
                    } catch (err) {
                        console.error("Error parsing message:", err);
                    }
                };

                ws.onerror = (err) => {
                    console.error("WS error:", err);
                };

                ws.onclose = () => {
                    if (isMounted) {
                        reconnectTimeout = setTimeout(connect, 3000);
                    }
                };
            } catch (err) {
                console.error("Failed to create WebSocket:", err);
                if (isMounted) {
                    reconnectTimeout = setTimeout(connect, 3000);
                }
            }
        };

        connect();

        return () => {
            isMounted = false;
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
        };
    }, [isLoadingHistory]);

    // Compute stats
    const totalAttacks = logs.length;

    const uniqueIPs = new Set(
        logs.map((l) => l.src_ip || l.ip || l.source_ip).filter(Boolean)
    ).size;

    const countries = logs
        .map((l) => l.country)
        .filter((country) => country && country.length > 0);

    const uniqueCountries = new Set(countries).size;

    const timestamps = logs
        .map((l) => {
            if (!l.timestamp) return null;

            try {
                const time = new Date(l.timestamp).getTime();
                if (isNaN(time) || time < 0) return null;
                return time;
            } catch {
                return null;
            }
        })
        .filter((t): t is number => t !== null && t > 0)
        .sort((a, b) => a - b);

    let attackRate = 0;
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

    const stats: AttackStats = {
        totalAttacks,
        uniqueIPs,
        totalCountries: uniqueCountries,
        attackRate: Number(attackRate.toFixed(2)),
        logs,
    };

    return stats;
}