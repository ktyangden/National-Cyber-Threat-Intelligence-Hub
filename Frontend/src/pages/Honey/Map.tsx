import { useState, useEffect, useCallback, useMemo } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MapGL, { Source, Layer, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  type CountryCounts,
  loadCountriesGeoJson,
  processGeoJsonWithCounts,
} from "@/lib/mapUtils";

interface HeatmapProps {
  onDataUpdate?: (data: {
    countryCounts: Record<string, number>;
    maxCount: number;
  }) => void;
}

export default function Heatmap({ onDataUpdate }: HeatmapProps) {
  const [countryCounts, setCountryCounts] = useState<CountryCounts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<{
    country: string;
    count: number;
    lng: number;
    lat: number;
  } | null>(null);
  const [countriesGeoJson, setCountriesGeoJson] = useState<any>(null);

  const MAPBOX_TOKEN =
    import.meta.env.VITE_MAPBOX_TOKEN ||
    "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

  const fetchCountryCounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.DEV
        ? `/api/v1/ext/logs/country-counts`
        : `${import.meta.env.VITE_GATEWAY_URL || "http://localhost:3002"}/api/v1/ext/logs/country-counts`;

      const response = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const data = await response.json();
      setCountryCounts(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch country counts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCountriesGeoJson().then(setCountriesGeoJson).catch(console.error);
  }, []);

  useEffect(() => {
    fetchCountryCounts();
    const interval = setInterval(fetchCountryCounts, 5000);
    return () => clearInterval(interval);
  }, [fetchCountryCounts]);

  const maxCount = Math.max(...Object.values(countryCounts), 1);

  // push data up to Honey.tsx
  useEffect(() => {
    onDataUpdate?.({ countryCounts, maxCount });
  }, [countryCounts, maxCount]);

  const styledGeoJson = useMemo(() => {
    if (!countriesGeoJson || !countryCounts) return null;
    return processGeoJsonWithCounts(countriesGeoJson, countryCounts).geoJson;
  }, [countriesGeoJson, countryCounts]);

  const onHover = useCallback((event: any) => {
    const feature = event.features?.[0];
    if (feature && event.lngLat) {
      setHoveredCountry({
        country:
          feature.properties?.ISO_A2 ||
          feature.properties?.ISO_A3 ||
          feature.properties?.NAME ||
          "Unknown",
        count: feature.properties?.count || 0,
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
      });
    }
  }, []);

  const onLeave = useCallback(() => setHoveredCountry(null), []);

  const totalAttacks = Object.values(countryCounts).reduce((a, b) => a + b, 0);
  const topCountryEntry =
    Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0] || null;

  return (
    <section id="#heatmap" className="space-y-6">

      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Attack Heatmap</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Geographic distribution
            {lastUpdated && (
              <span className="ml-2">• Updated {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
        </div>

        <Button
          onClick={fetchCountryCounts}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Total Attacks</p>
          <p className="text-2xl font-bold">{totalAttacks}</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Countries</p>
          <p className="text-2xl font-bold">{Object.keys(countryCounts).length}</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Top Country</p>
          <p className="text-2xl font-bold">
            {topCountryEntry ? `${topCountryEntry[0]}: ${topCountryEntry[1]}` : "N/A"}
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="border rounded-lg bg-card p-6">
        <div className="aspect-video rounded-lg overflow-hidden relative">
          {!countriesGeoJson ? (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <p className="text-sm text-muted-foreground">Loading world map…</p>
            </div>
          ) : (
            <MapGL mapboxAccessToken={MAPBOX_TOKEN} initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5 }}
              style={{ width: "100%", height: "100%" }} mapStyle="mapbox://styles/mapbox/dark-v11"
              interactiveLayerIds={["countries-layer"]} onMouseMove={onHover} onMouseLeave={onLeave} cursor="pointer"
            >
              {styledGeoJson && (
                <Source id="countries" type="geojson" data={styledGeoJson}>
                  <Layer id="countries-layer" type="fill"
                    paint={{
                      "fill-color": [
                        "case",
                        [">", ["get", "count"], 0],
                        [
                          "interpolate",
                          ["linear"],
                          ["get", "count"],
                          0,
                          "#e5e7eb",
                          maxCount * 0.25,
                          "rgb(255, 200, 200)",
                          maxCount * 0.5,
                          "rgb(255, 150, 150)",
                          maxCount * 0.75,
                          "rgb(255, 100, 100)",
                          maxCount,
                          "rgb(200, 50, 50)",
                        ],
                        "#e5e7eb",
                      ],
                      "fill-opacity": 0.7,
                    }}
                  />

                  <Layer id="countries-outline" type="line"
                    paint={{
                      "line-color": "#fff",
                      "line-width": 0.5,
                      "line-opacity": 0.3,
                    }}
                  />
                </Source>
              )}

              {/* Hover popup */}
              {hoveredCountry && hoveredCountry.count > 0 && (
                <Popup longitude={hoveredCountry.lng} latitude={hoveredCountry.lat} anchor="bottom" closeButton={false} closeOnClick={false} offset={[0, -10]}>
                  <div className="px-2 py-1">
                    <p className="font-semibold text-sm">
                      {hoveredCountry.country}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hoveredCountry.count} attacks
                    </p>
                  </div>
                </Popup>
              )}
            </MapGL>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span>Intensity:</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-3 rounded" style={{ background: "linear-gradient(to right, #e5e7eb, rgb(255,200,200), rgb(255,150,150), rgb(255,100,100), rgb(200,50,50))"}}/>
            <span>Low</span>
            <span>→</span>
            <span>High</span>
          </div>
          <span className="ml-auto">Max: {maxCount}</span>
        </div>
      </div>
    </section>
  );
}
