import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MapGL, { Source, Layer, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  type CountryCounts,
  loadCountriesGeoJson,
  processGeoJsonWithCounts,
  getColorIntensity,
} from '@/lib/mapUtils';

export default function Map() {
  const [countryCounts, setCountryCounts] = useState<CountryCounts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<{ country: string; count: number; lng: number; lat: number } | null>(null);
  const [countriesGeoJson, setCountriesGeoJson] = useState<any>(null);
  
  // Mapbox access token - use public token or set VITE_MAPBOX_TOKEN env var
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

  const fetchCountryCounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = import.meta.env.DEV 
        ? `/api/v1/ext/logs/country-counts`
        : `${import.meta.env.VITE_GATEWAY_URL || 'http://localhost:3002'}/api/v1/ext/logs/country-counts`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCountryCounts(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch country counts');
      console.error('Error fetching country counts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load world countries GeoJSON
  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        const data = await loadCountriesGeoJson();
        setCountriesGeoJson(data);
      } catch (err) {
        console.error('Error loading countries GeoJSON:', err);
      }
    };
    
    loadGeoJson();
  }, []);

  useEffect(() => {
    fetchCountryCounts();
    
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchCountryCounts, 5000);
    
    return () => clearInterval(interval);
  }, [fetchCountryCounts]);

  // Calculate max count for color scaling
  const maxCount = Math.max(...Object.values(countryCounts), 1);
  
  // Create styled GeoJSON with country counts
  const styledGeoJson = useMemo(() => {
    if (!countriesGeoJson || !countryCounts) return null;
    
    const { geoJson } = processGeoJsonWithCounts(countriesGeoJson, countryCounts);
    
    return geoJson;
  }, [countriesGeoJson, countryCounts]);

  // Handle map click/hover
  const onHover = useCallback((event: any) => {
    const feature = event.features?.[0];
    if (feature && event.lngLat) {
      const country = feature.properties?.ISO_A2 || feature.properties?.ISO_A3 || feature.properties?.NAME || 'Unknown';
      const count = feature.properties?.count || 0;
      setHoveredCountry({
        country,
        count,
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
      });
    }
  }, []);

  const onLeave = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  // Get top countries for display
  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const totalAttacks = Object.values(countryCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Attack Heatmap</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Geographic distribution of attack sources
            {lastUpdated && (
              <span className="ml-2">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
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
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")}/>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Error loading heatmap data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading && Object.keys(countryCounts).length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading heatmap data...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-sm text-muted-foreground">Total Attacks</p>
              <p className="text-2xl font-bold text-foreground">{totalAttacks}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-sm text-muted-foreground">Countries</p>
              <p className="text-2xl font-bold text-foreground">{Object.keys(countryCounts).length}</p>
            </div>
            <div className="p-4 border rounded-lg bg-card">
              <p className="text-sm text-muted-foreground">Top Country</p>
              <p className="text-2xl font-bold text-foreground">
                {topCountries[0] ? `${topCountries[0][0]}: ${topCountries[0][1]}` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Interactive Map Visualization */}
          <div className="border rounded-lg bg-card p-6">
            <div className="aspect-video rounded-lg overflow-hidden relative">
              {!countriesGeoJson ? (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center text-muted-foreground">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading map data...</p>
                  </div>
                </div>
              ) : Object.keys(countryCounts).length === 0 ? (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg font-medium mb-2">No attack data yet</p>
                    <p className="text-sm">Attack data will appear here as logs are processed</p>
                  </div>
                </div>
              ) : (
                <MapGL
                  mapboxAccessToken={MAPBOX_TOKEN}
                  initialViewState={{
                    longitude: 0,
                    latitude: 20,
                    zoom: 1.5,
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/dark-v11"
                  interactiveLayerIds={['countries-layer']}
                  onMouseMove={onHover}
                  onMouseLeave={onLeave}
                  cursor="pointer"
                >
                  {styledGeoJson && (
                    <Source id="countries" type="geojson" data={styledGeoJson}>
                      <Layer
                        id="countries-layer"
                        type="fill"
                        paint={{
                          'fill-color': [
                            'case',
                            ['>', ['get', 'count'], 0],
                            [
                              'interpolate',
                              ['linear'],
                              ['get', 'count'],
                              0, '#e5e7eb',
                              maxCount * 0.25, 'rgb(255, 200, 200)',
                              maxCount * 0.5, 'rgb(255, 150, 150)',
                              maxCount * 0.75, 'rgb(255, 100, 100)',
                              maxCount, 'rgb(200, 50, 50)',
                            ],
                            '#e5e7eb', // gray for no data
                          ],
                          'fill-opacity': 0.7,
                        }}
                      />
                      <Layer
                        id="countries-outline"
                        type="line"
                        paint={{
                          'line-color': '#ffffff',
                          'line-width': 0.5,
                          'line-opacity': 0.3,
                        }}
                      />
                    </Source>
                  )}
                  {hoveredCountry && hoveredCountry.count > 0 && (
                    <Popup
                      longitude={hoveredCountry.lng}
                      latitude={hoveredCountry.lat}
                      anchor="bottom"
                      closeButton={false}
                      closeOnClick={false}
                      offset={[0, -10]}
                    >
                      <div className="px-2 py-1">
                        <p className="font-semibold text-sm">{hoveredCountry.country}</p>
                        <p className="text-xs text-muted-foreground">
                          {hoveredCountry.count} {hoveredCountry.count === 1 ? 'attack' : 'attacks'}
                        </p>
                      </div>
                    </Popup>
                  )}
                </MapGL>
              )}
            </div>
            {/* Legend */}
            {maxCount > 0 && (
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Intensity:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-3 rounded" style={{ background: 'linear-gradient(to right, #e5e7eb, rgb(255, 200, 200), rgb(255, 150, 150), rgb(255, 100, 100), rgb(200, 50, 50))' }} />
                  <span>Low</span>
                  <span>→</span>
                  <span>High</span>
                </div>
                <span className="ml-auto">Max: {maxCount} attacks</span>
              </div>
            )}
          </div>

          {/* Top Countries Table */}
          {topCountries.length > 0 && (
            <div className="border rounded-lg bg-card">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-foreground">Top 10 Countries by Attack Count</h3>
              </div>
              <div className="overflow-x-auto rounded-b-xl">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Country Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Attacks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Intensity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topCountries.map(([country, count], index) => (
                      <tr key={country} className="hover:bg-muted/50 bg-background border border-muted transition-colors">
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-foreground">
                          {country}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {count}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-24 rounded" style={{ backgroundColor: getColorIntensity(count, maxCount) }}/>
                                <span className="text-xs text-muted-foreground">{Math.round((count / maxCount) * 100)}%</span>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All Countries (if not too many) */}
          {Object.keys(countryCounts).length > 0 && Object.keys(countryCounts).length <= 50 && (
            <div className="border rounded-lg bg-card p-4">
              <h3 className="font-semibold text-foreground mb-3">All Countries</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(countryCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([country, count]) => (
                    <div
                      key={country}
                      className="px-3 py-1 rounded text-xs border"
                      style={{ 
                        backgroundColor: getColorIntensity(count, maxCount) + '20',
                        borderColor: getColorIntensity(count, maxCount),
                      }}
                    >
                      <span className="font-mono font-semibold">{country}</span>
                      <span className="ml-2 text-muted-foreground">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
